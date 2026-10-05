from datetime import datetime, timedelta, timezone
import hashlib
import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.models.phone_otp import PhoneOTP
from app.models.shop_base import ShopBase
from app.models.shop_additional import ShopAdditional
from app.schemas.shop_base import ShopMeResponse
from app.models.permission import Permission
from app.models.user_permission import UserPermission
from app.core.security import (
    verify_password,
    hash_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.permissions import Perm
from app.core.dependencies import get_current_user
from app.services.sms import send_sms
from app.schemas.auth import (
    LoginRequest,
    OTPRequest,
    OTPVerifyRequest,
    OTPRequestResponse,
    OTPVerifyResponse,
    TokenResponse,
    RefreshRequest,
    UserResponse,
    DetailResponse,
    PasswordChangeRequest,
    PhoneChangeRequest,
    PhoneChangeVerifyRequest,
)

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == payload.username))
    user = result.scalar_one_or_none()
    if not user or not user.password or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    token_data = {"sub": str(user.id)}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
    )

#Provereno i isprawleno mnoy. 
def _hash_otp(phone: str, code: str) -> str:
    return hashlib.sha256(f"{phone}:{code}".encode("utf-8")).hexdigest()

async def _issue_otp(db: AsyncSession, phone_number: str) -> None:
    """
    Отправляет код на номер.

    Вынесено из входа, потому что кодом подтверждается не только вход, но и
    смена своего номера. Вторая реализация означала бы вторую выдержку между
    отправками, второй срок жизни и второй счётчик попыток — то есть путь в
    обход ограничений входа.
    """
    now = datetime.now(timezone.utc)

    last_otp_result = await db.execute(
        select(PhoneOTP)
        .where(PhoneOTP.phone == phone_number)
        .order_by(PhoneOTP.id.desc())
    )
    last_otp = last_otp_result.scalars().first()
    if last_otp and last_otp.expires_at:
        last_sent = last_otp.expires_at - timedelta(minutes=3)
        if last_sent.tzinfo is None:
            last_sent = last_sent.replace(tzinfo=timezone.utc)
        if (now - last_sent) < timedelta(minutes=1):
            raise HTTPException(status_code=429, detail="Please wait 1 minute before requesting a new OTP.")

    code = f"{secrets.randbelow(1000000):06d}"
    otp = PhoneOTP(
        phone=phone_number,
        code_hash=_hash_otp(phone_number, code),
        created_at=now,
        expires_at=now + timedelta(minutes=3),
        attempts=0,
        max_attempts=5,
        is_used=False,
    )
    db.add(otp)
    await db.commit()

    print(f"[OTP] phone={phone_number} code={code}")
    await send_sms(phone_number, code)


async def _consume_otp(db: AsyncSession, phone_number: str, code: str) -> PhoneOTP:
    """
    Проверяет код и возвращает запись, НЕ помечая её использованной.

    Гасит код вызывающий — в той же транзакции, что и действие, ради которого
    код запрашивался. Иначе при отказе на следующем шаге код уже сгорел бы, а
    действие не произошло, и пользователю пришлось бы ждать выдержку заново.
    """
    otp_result = await db.execute(
        select(PhoneOTP)
        .where(PhoneOTP.phone == phone_number, PhoneOTP.is_used == False)
        .order_by(PhoneOTP.id.desc())
    )
    otp = otp_result.scalars().first()
    now = datetime.now(timezone.utc)

    if not otp:
        raise HTTPException(status_code=401, detail="Invalid or expired OTP")
    expires_at = otp.expires_at if otp.expires_at.tzinfo else otp.expires_at.replace(tzinfo=timezone.utc)
    if expires_at <= now:
        raise HTTPException(status_code=401, detail="Invalid or expired OTP")
    if otp.attempts >= otp.max_attempts:
        raise HTTPException(status_code=429, detail="Too many OTP attempts")

    incoming_hash = _hash_otp(phone_number, code)
    if incoming_hash != otp.code_hash:
        otp.attempts += 1
        await db.commit()
        raise HTTPException(status_code=401, detail="Invalid or expired OTP")

    return otp


#Provereno i isprawleno mnoy.
@router.post("/otp/request", response_model=OTPRequestResponse)
async def request_otp(payload: OTPRequest, db: AsyncSession = Depends(get_db)):
    phone_number = payload.phone_number.strip()
    if not phone_number:
        raise HTTPException(status_code=400, detail="Phone number is required")

    await _issue_otp(db, phone_number)
    return OTPRequestResponse(detail="OTP sent")


#Provereno i isprawleno mnoy.
@router.post("/otp/verify", response_model=OTPVerifyResponse)
async def verify_otp(payload: OTPVerifyRequest, db: AsyncSession = Depends(get_db)):
    phone_number = payload.phone_number.strip()
    code = payload.code.strip()
    if not phone_number or not code:
        raise HTTPException(status_code=400, detail="Phone number and code are required")

    otp = await _consume_otp(db, phone_number, code)

    user_result = await db.execute(select(User).where(User.phone == phone_number))
    user = user_result.scalar_one_or_none()
    if user is None:
        user = User(phone=phone_number, is_active=True, client=True)
        db.add(user)
        await db.flush()

        # Набор прав, который получает каждый зарегистрировавшийся по SMS.
        # Он широкий не по ошибке: у платформы нет отдельной роли продавца —
        # любой пользователь может открыть магазин, поэтому права продавца
        # выдаются сразу. Проверку «своё или чужое» они не заменяют: она
        # живёт в app/core/ownership.py и стоит на каждом из этих методов.
        # Ниже расписано, зачем нужно каждое право.
        new_user_perms = [
            # Свой магазин: открыть, заполнить, закрыть и открыть обратно.
            Perm.SHOP_BASES_READ, Perm.SHOP_BASES_CREATE, Perm.SHOP_BASES_UPDATE,
            Perm.SHOP_BASES_BLOCK,
            # Профиль магазина: название, логотип, адреса, телефоны.
            # shop_additionals:read закрывает только выдачу по id — список и
            # выдача по магазину публичны. Оставлено ради совместимости с уже
            # работающими клиентами, защитой считать его нельзя.
            Perm.SHOP_ADDITIONALS_READ, Perm.SHOP_ADDITIONALS_CREATE,
            Perm.SHOP_ADDITIONALS_UPDATE,
            # Свои товары: создать, править, снять с продажи и вернуть.
            Perm.PRODUCTS_READ, Perm.PRODUCTS_CREATE, Perm.PRODUCTS_UPDATE,
            Perm.PRODUCTS_BLOCK,
            # Свой профиль пользователя. Правка чужого запрещена в users.py.
            Perm.USERS_UPDATE,
            # Покупки: корзина, избранное, оформление, свои заказы.
            Perm.CART_READ, Perm.CART_MANAGE,
            Perm.FAVORITES_READ, Perm.FAVORITES_MANAGE,
            # Свои адреса доставки: раньше адрес набирался заново при каждом
            # оформлении, сохранить его было нельзя.
            Perm.ADDRESSES_READ, Perm.ADDRESSES_MANAGE,
            # Отзыв о купленном товаре. Проверку «куплено и получено» право не
            # заменяет: она стоит в reviews.py.
            Perm.REVIEWS_CREATE,
            # Заявка на возврат купленного. Решение по ней принимает платформа.
            Perm.RETURNS_CREATE,
            Perm.ORDERS_CREATE, Perm.ORDERS_READ_OWN,
            # pickup_points:read — как и shop_additionals:read, закрывает только
            # выдачу по id при публичном списке.
            Perm.PICKUP_POINTS_READ,
            # Заказы своего магазина: список, карточка, статистика и смена
            # статуса своей части. orders:read даёт общий список, но он
            # фильтруется по владельцу — сотрудника отличает отдельная проверка.
            Perm.ORDERS_READ, Perm.ORDERS_UPDATE_SHOP_STATUS,
            # Склад своего магазина: движения и приходы. Подтверждение прихода
            # (stock_receipts:confirm) сюда не входит — это работа платформы.
            Perm.STOCK_OPERATIONS_CREATE, Perm.STOCK_OPERATIONS_READ,
            Perm.STOCK_RECEIPTS_CREATE, Perm.STOCK_RECEIPTS_READ,
            # Список складов платформы: без него приход не создать — в нём надо
            # указать склад. Это адреса складов оператора, а не чужие данные,
            # и продавцу они нужны, чтобы знать, куда везти товар.
            Perm.WAREHOUSES_READ,
            # categories:read из набора убрано: право мёртвое, ни один метод
            # его не требует, все чтения категорий публичны.
        ]
        perm_result = await db.execute(select(Permission).where(Permission.code.in_(new_user_perms)))
        permissions = perm_result.scalars().all()
        for perm in permissions:
            db.add(UserPermission(user_id=user.id, permission_id=perm.id))
    elif not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    otp.is_used = True
    user_id = user.id
    await db.commit()

    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one()

    token_data = {"sub": str(user.id)}
    return OTPVerifyResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        id=user.id,
        name=user.name,
        surname=user.surname,
        username=user.username,
        email=user.email,
        phone=user.phone,
        is_active=user.is_active,
        client=user.client,
        permissions=user.permissions,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(payload: RefreshRequest, db: AsyncSession = Depends(get_db)):
    data = decode_token(payload.refresh_token)
    if not data or data.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    result = await db.execute(select(User).where(User.id == int(data["sub"])))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    token_data = {"sub": data["sub"]}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
    )

@router.post("/password/change", response_model=DetailResponse)
async def change_password(
    payload: PasswordChangeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Смена своего пароля.

    Раньше пароль ставился через PUT /users/{id}, и текущий там не спрашивали:
    один украденный токен превращался в постоянный захват аккаунта — владелец
    терял вход, а срок жизни токена уже ничего не значил. Теперь текущий пароль
    обязателен, и правка через users его больше не принимает.

    Единственное исключение — учётная запись без пароля: она создана входом по
    SMS, пароля у неё никогда не было, и подтверждать нечем. Такой пользователь
    задаёт пароль впервые, ни у кого ничего не отбирая: до этого пароль не
    открывал доступ к его аккаунту, потому что пароля не существовало.

    Сброс пароля сотрудником — отдельная история и остаётся в PUT /users/{id}:
    у платформы нет другого способа вернуть доступ по обращению в поддержку.
    """
    if current_user.password:
        if not payload.current_password:
            raise HTTPException(status_code=400, detail="Current password is required")
        if not verify_password(payload.current_password, current_user.password):
            raise HTTPException(status_code=403, detail="Current password is incorrect")
        if payload.new_password == payload.current_password:
            raise HTTPException(
                status_code=400, detail="New password must differ from the current one"
            )

    current_user.password = hash_password(payload.new_password)
    await db.commit()
    return DetailResponse(detail="Password changed")


@router.post("/phone/change/request", response_model=DetailResponse)
async def request_phone_change(
    payload: PhoneChangeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Первый шаг смены своего номера: код уходит на НОВЫЙ номер.

    Номер — это логин: вход по SMS идёт по нему, и пароль для этого не нужен.
    Правка через PUT /users/{id} меняла его без всякого подтверждения, то есть
    украденным токеном можно было навсегда забрать вход у владельца: код на
    старый номер больше не приходил бы.

    Код идёт на новый номер, а не на старый, потому что доказать надо именно
    владение новым: иначе пользователь запросто уведёт свой аккаунт на чужой
    или несуществующий номер и потеряет вход сам.
    """
    new_phone = payload.new_phone.strip()
    if not new_phone:
        raise HTTPException(status_code=400, detail="Phone number is required")
    if new_phone == current_user.phone:
        raise HTTPException(status_code=400, detail="This is already your phone number")

    taken = await db.execute(
        select(User).where(User.phone == new_phone, User.id != current_user.id)
    )
    if taken.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Phone already taken")

    await _issue_otp(db, new_phone)
    return DetailResponse(detail="OTP sent")


@router.post("/phone/change/verify", response_model=DetailResponse)
async def verify_phone_change(
    payload: PhoneChangeVerifyRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Второй шаг: код с нового номера подтверждает смену.

    Занятость номера проверяется ещё раз: между запросом кода и подтверждением
    его мог занять кто-то другой, а два аккаунта с одним номером сделали бы
    вход по SMS неоднозначным.
    """
    new_phone = payload.new_phone.strip()
    code = payload.code.strip()
    if not new_phone or not code:
        raise HTTPException(status_code=400, detail="Phone number and code are required")

    taken = await db.execute(
        select(User).where(User.phone == new_phone, User.id != current_user.id)
    )
    if taken.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Phone already taken")

    otp = await _consume_otp(db, new_phone, code)
    otp.is_used = True
    current_user.phone = new_phone
    await db.commit()
    return DetailResponse(detail="Phone changed")


#Provereno i isprawleno mnoy.
@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ShopBase, ShopAdditional)
        .outerjoin(ShopAdditional, ShopAdditional.shop_base_id == ShopBase.id)
        .where(ShopBase.owner_id == current_user.id)
    )
    shops = [
        ShopMeResponse(
            id=sb.id,
            registration_status=sb.registration_status,
            # Причина отказа нужна именно здесь: кабинет и страница активации
            # берут состояние магазина из профиля, а не отдельным запросом.
            registration_comment=sb.registration_comment,
            is_active=sb.is_active,
            blocked_by_staff=bool(sb.blocked_by_staff),
            name=sa.name if sa else None,
            logo_path=sa.logo_path if sa else None,
        )
        for sb, sa in result.all()
    ]
    return {**current_user.__dict__, "shops": shops}