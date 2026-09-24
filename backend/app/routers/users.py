from fastapi import APIRouter, Depends, HTTPException, status, Response, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.core.pagination import limit_param, paginate, skip_param
from app.models.user import User
from app.core.security import hash_password
from app.core.dependencies import get_current_user, require_permissions
from app.core.ownership import STAFF_USERS, is_staff
from app.core.permissions import Perm
from app.schemas.user import UserCreateRequest, UserUpdateRequest, UserDetailResponse, UserListResponse

from app.core.search import normalize_term, text_matches
from typing import Optional
router = APIRouter()


async def get_user_or_404(user_id: int, db: AsyncSession) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/", response_model=UserDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: UserCreateRequest,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.USERS_CREATE)),
):
    # Check username uniqueness
    if payload.username is not None:
        result = await db.execute(select(User).where(User.username == payload.username))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Username already taken")

    # Check email uniqueness
    if payload.email is not None:
        result = await db.execute(select(User).where(User.email == payload.email))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email already taken")

    # Check phone uniqueness
    if payload.phone is not None:
        result = await db.execute(select(User).where(User.phone == payload.phone))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Phone already taken")

    user = User(
        name=payload.name,
        surname=payload.surname,
        username=payload.username,
        email=payload.email,
        phone=payload.phone,
        password=hash_password(payload.password) if payload.password is not None else None,
        is_active=True,
        # Признак «покупатель» раньше не передавался, поэтому созданный
        # администратором пользователь всегда оставался сотрудником.
        client=payload.client,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.get("/", response_model=list[UserListResponse])
async def get_users(
    response: Response = None,  # type: ignore[assignment]
    skip: int = skip_param(),
    limit: int = limit_param(20),
    name: Optional[str] = Query(default=None, description="Фильтр по части названия"),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.USERS_READ)),
):
    query = select(User)
    # Поля поиска в админке не было, потому что искать было нечем: параметра
    # у метода не существовало, и найти запись за пределами первой страницы
    # оказывалось невозможно.
    term = normalize_term(name)
    if term:
        query = query.where(
            text_matches(term, User.username, User.name, User.surname, User.phone, User.email)
        )

    result = await db.execute(await paginate(db, response, query, skip=skip, limit=limit))
    return result.scalars().all()


@router.get("/me", response_model=UserDetailResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Текущий пользователь видит свой профиль и список своих прав."""
    return current_user


@router.get("/{user_id}", response_model=UserDetailResponse)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.USERS_READ)),
):
    return await get_user_or_404(user_id, db)


@router.put("/{user_id}", response_model=UserDetailResponse)
async def update_user(
    user_id: int,
    payload: UserUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.USERS_UPDATE)),
):
    """Правка пользователя.

    Право users:update выдаётся каждому при регистрации, а проверки, чья это
    запись, здесь не было вовсе. То есть любой зарегистрировавшийся мог задать
    администратору новые логин и пароль и войти под ними — это подтверждалось
    запросом.

    Теперь чужую запись правит только сотрудник платформы. Логин чужому не
    меняет никто, даже сотрудник: подмена логина — это и есть захват аккаунта,
    а законной причины переименовать чужой вход нет. Пароль сотрудник сменить
    может: это сброс пароля по обращению в поддержку, других способов вернуть
    доступ у платформы нет.

    Свой пароль и свой номер здесь не меняются — для них есть отдельные методы
    с подтверждением (POST /auth/password/change и POST /auth/phone/change/*).
    Причина в том, что здесь подтверждать нечем: метод открыт по токену, и без
    текущего пароля или кода на номер украденный токен означал бы вечный захват
    аккаунта, а не доступ до истечения токена.
    """
    is_self = user_id == current_user.id
    staff = is_staff(current_user, *STAFF_USERS)
    if not is_self and not staff:
        raise HTTPException(status_code=403, detail="You can only edit your own profile")

    if not is_self and payload.username is not None:
        raise HTTPException(
            status_code=403,
            detail="Changing login of another user is not allowed",
        )

    # Свой пароль — только через метод, который спрашивает текущий.
    if is_self and payload.password is not None:
        raise HTTPException(
            status_code=400,
            detail="Use POST /auth/password/change to change your own password",
        )

    # Номер — это логин для входа по SMS, наравне с username. Свой меняется
    # кодом на новый номер, чужой не меняет никто.
    if payload.phone is not None:
        raise HTTPException(
            status_code=400 if is_self else 403,
            detail=(
                "Use POST /auth/phone/change/request to change your own phone"
                if is_self
                else "Changing phone of another user is not allowed"
            ),
        )

    user = await get_user_or_404(user_id, db)

    if payload.username is not None:
        conflict = await db.execute(
            select(User).where(User.username == payload.username, User.id != user_id)
        )
        if conflict.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Username already taken")

    if payload.email is not None:
        conflict = await db.execute(
            select(User).where(User.email == payload.email, User.id != user_id)
        )
        if conflict.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email already taken")

    # Проверки занятости номера здесь нет: до неё уже не доходит — номер этот
    # метод не меняет. Она стоит в POST /auth/phone/change/*, где номер и
    # меняется.

    update_data = payload.model_dump(exclude_unset=True)

    if "password" in update_data:
        update_data["password"] = (
            hash_password(update_data["password"])
            if update_data["password"] is not None
            else None
        )

    for field, value in update_data.items():
        setattr(user, field, value)

    await db.commit()
    await db.refresh(user)
    return user


@router.patch("/{user_id}/block", response_model=UserDetailResponse)
async def block_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.USERS_BLOCK)),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot block yourself")

    user = await get_user_or_404(user_id, db)
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User is already blocked")

    user.is_active = False
    await db.commit()
    await db.refresh(user)
    return user


@router.patch("/{user_id}/unblock", response_model=UserDetailResponse)
async def unblock_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.USERS_BLOCK)),
):
    user = await get_user_or_404(user_id, db)
    if user.is_active:
        raise HTTPException(status_code=400, detail="User is already active")

    user.is_active = True
    await db.commit()
    await db.refresh(user)
    return user
