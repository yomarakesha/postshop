import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query, Response
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import exists, select
from sqlalchemy.orm import aliased, selectinload
from app.core.images import remove_files, check_content_type, process_upload

from app.database import get_db
from app.core.pagination import limit_param, paginate, skip_param
from app.models.shop_additional import ShopAdditional, WarehouseType
from app.models.shop_base import ShopBase, RegistrationStatus
from app.models.city import City
from app.models.region import Region
from app.models.country import Country
from app.schemas.shop_additional import ShopAdditionalResponse, ShopAdditionalUpdate
from app.core.dependencies import get_optional_user, require_permissions
from app.core.visibility import shop_public_conditions
from app.services.stock import warehouse_type_change_blockers
from app.config import settings
from app.core.ownership import STAFF_SHOPS, ensure_can_manage_shop, is_staff
from app.models.user import User
from app.core.permissions import Perm

router = APIRouter()

LOGO_UPLOAD_DIR = "uploads/logos"
os.makedirs(LOGO_UPLOAD_DIR, exist_ok=True)


# Эти эндпоинты принимают multipart, а не схему, поэтому ограничения из
# ShopAdditionalUpdate к ним не применяются: раньше у магазина спокойно
# сохранялось восемь телефонов и сколько угодно адресов (B-06).
MAX_ADDRESSES = 20
MAX_PHONE_NUMBERS = 10


def _check_list_limits(addresses, phone_numbers) -> None:
    if addresses is not None and len(addresses) > MAX_ADDRESSES:
        raise HTTPException(
            status_code=422,
            detail=f"addresses: at most {MAX_ADDRESSES} items allowed, got {len(addresses)}",
        )
    if phone_numbers is not None and len(phone_numbers) > MAX_PHONE_NUMBERS:
        raise HTTPException(
            status_code=422,
            detail=f"phone_numbers: at most {MAX_PHONE_NUMBERS} items allowed, "
                   f"got {len(phone_numbers)}",
        )


def _shop_additional_query():
    return select(ShopAdditional).options(
        selectinload(ShopAdditional.city).options(
            selectinload(City.translations),
            selectinload(City.region).options(
                selectinload(Region.translations),
                selectinload(Region.country).selectinload(Country.translations),
            ),
        )
    )


async def get_shop_additional_or_404(shop_additional_id: int, db: AsyncSession) -> ShopAdditional:
    result = await db.execute(
        _shop_additional_query().where(ShopAdditional.id == shop_additional_id)
    )
    shop_add = result.scalar_one_or_none()
    if not shop_add:
        raise HTTPException(status_code=404, detail="Shop additional not found")
    return shop_add


async def process_and_save_logo(file: UploadFile, shop_base_id: int) -> str:
    check_content_type(file)
    content = await file.read()
    filepath = f"{LOGO_UPLOAD_DIR}/{shop_base_id}_{uuid.uuid4().hex}.webp"
    process_upload(content, filepath, file.filename or "image")
    return filepath


def _check_fbo_allowed(warehouse_type: WarehouseType | None) -> None:
    """FBO выбирается, только пока платформа принимает товар на хранение."""
    if warehouse_type == WarehouseType.fbo and not settings.FBO_ENABLED:
        raise HTTPException(
            status_code=409,
            detail="Platform warehouse (FBO) is disabled: shops work as FBS only.",
        )


async def verify_city_exists(city_id: int, db: AsyncSession) -> None:
    result = await db.execute(select(City).where(City.id == city_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail=f"City with id={city_id} not found")


@router.post("/", response_model=ShopAdditionalResponse, status_code=status.HTTP_201_CREATED)
async def create_shop_additional(
    shop_base_id: int = Form(...),
    city_id: Optional[int] = Form(None),
    warehouse_type: WarehouseType = Form(...),
    name: str = Form(None),
    description: str = Form(None),
    addresses: List[str] = Form(None),
    phone_numbers: List[str] = Form(None),
    color: str = Form(None),
    color_text: str = Form(None),
    logo: UploadFile = File(None, description="Логотип (будет сконвертирован в .webp)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.SHOP_ADDITIONALS_CREATE))
):
    base_result = await db.execute(select(ShopBase).where(ShopBase.id == shop_base_id))
    if not base_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Shop base not found")

    exist_result = await db.execute(select(ShopAdditional).where(ShopAdditional.shop_base_id == shop_base_id))
    if exist_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Shop additional info already exists for this base")

    _check_fbo_allowed(warehouse_type)

    if city_id is not None:
        await verify_city_exists(city_id, db)

    logo_path = None
    if logo is not None:
        logo_path = await process_and_save_logo(logo, shop_base_id)

    _check_list_limits(addresses, phone_numbers)

    # Профиль магазина один на магазин, и раньше посторонний мог создать его
    # чужому — после чего настоящий владелец свой создать уже не мог.
    await ensure_can_manage_shop(shop_base_id, current_user, db)

    shop_add = ShopAdditional(
        shop_base_id=shop_base_id,
        city_id=city_id,
        warehouse_type=warehouse_type,
        name=name,
        description=description,
        addresses=addresses or [],
        phone_numbers=phone_numbers or [],
        color=color,
        color_text=color_text,
        logo_path=logo_path,
    )
    db.add(shop_add)
    await db.commit()
    return await get_shop_additional_or_404(shop_add.id, db)


@router.get("/", response_model=list[ShopAdditionalResponse])
async def get_shop_additionals(
    response: Response = None,  # type: ignore[assignment]
    skip: int = skip_param(),
    limit: int = limit_param(20),
    name: Optional[str] = None,
    registration_status: Optional[RegistrationStatus] = Query(
        default=None, description="Фильтр по статусу регистрации базового магазина"
    ),
    db: AsyncSession = Depends(get_db),
    viewer: User | None = Depends(get_optional_user),
):
    query = _shop_additional_query()
    # Покупателю — только магазины, которые можно показать (см. visibility).
    if viewer is None or not is_staff(viewer, *STAFF_SHOPS):
        base = aliased(ShopBase)
        query = query.where(
            exists(
                select(base.id).where(
                    base.id == ShopAdditional.shop_base_id,
                    *shop_public_conditions(base),
                )
            )
        )
    if name:
        query = query.where(ShopAdditional.name.ilike(f"%{name}%"))
    if registration_status is not None:
        query = query.join(
            ShopBase, ShopBase.id == ShopAdditional.shop_base_id
        ).where(ShopBase.registration_status == registration_status)
    result = await db.execute(await paginate(db, response, query, skip=skip, limit=limit))
    return list(result.scalars().all())


@router.get("/by-shop/{shop_base_id}", response_model=ShopAdditionalResponse)
async def get_shop_additional_by_shop_base(
    shop_base_id: int,
    db: AsyncSession = Depends(get_db),
    viewer: User | None = Depends(get_optional_user),
):
    result = await db.execute(
        _shop_additional_query().where(ShopAdditional.shop_base_id == shop_base_id)
    )
    shop_add = result.scalar_one_or_none()
    if not shop_add:
        raise HTTPException(status_code=404, detail="Shop additional not found for this shop base")

    # Страница магазина открывалась у любого магазина — заблокированного, ещё
    # не одобренного, не заполненного. Владелец и сотрудник видят его всегда:
    # владелец заполняет его в кабинете как раз по этому методу.
    shop = (await db.execute(select(ShopBase).where(ShopBase.id == shop_base_id))).scalar_one()
    is_owner = viewer is not None and shop.owner_id == viewer.id
    if not is_owner and (viewer is None or not is_staff(viewer, *STAFF_SHOPS)):
        visible = (await db.execute(
            select(ShopBase.id).where(ShopBase.id == shop_base_id, *shop_public_conditions())
        )).first()
        if not visible:
            raise HTTPException(status_code=404, detail="Shop additional not found for this shop base")
    return shop_add


@router.get("/{shop_additional_id}", response_model=ShopAdditionalResponse)
async def get_shop_additional(
    shop_additional_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.SHOP_ADDITIONALS_READ))
):
    return await get_shop_additional_or_404(shop_additional_id, db)


@router.delete("/{shop_additional_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_shop_additional(
    shop_additional_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.SHOP_ADDITIONALS_UPDATE)),
):
    """
    Удалить профиль магазина вместе с логотипом.

    Профиля, созданного не тому магазину, было не убрать: ни удаления, ни
    блокировки, а второй создать нельзя — слот занят. Магазин при этом
    остаётся, профиль создаётся заново.
    """
    shop_add = await get_shop_additional_or_404(shop_additional_id, db)
    await ensure_can_manage_shop(shop_add.shop_base_id, current_user, db)
    # Удалить профиль и создать заново — обход запрета менять тип склада:
    # новый профиль создаётся с любым типом. Продавцу это больше не доступно.
    if not is_staff(current_user, *STAFF_SHOPS):
        raise HTTPException(
            status_code=403,
            detail="Shop profile is deleted by platform staff only",
        )

    logo_path = shop_add.logo_path
    await db.delete(shop_add)
    await db.commit()
    # Файл удаляется после коммита: при неудачной фиксации ссылка в базе
    # указывала бы на уже удалённый логотип.
    remove_files([logo_path])


@router.put("/{shop_additional_id}", response_model=ShopAdditionalResponse)
async def update_shop_additional(
    shop_additional_id: int,
    city_id: Optional[int] = Form(None),
    warehouse_type: WarehouseType = Form(None),
    name: str = Form(None),
    description: str = Form(None),
    addresses: List[str] = Form(None),
    phone_numbers: List[str] = Form(None),
    color: str = Form(None),
    color_text: str = Form(None),
    logo: UploadFile = File(None, description="Новый логотип (необязательно)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.SHOP_ADDITIONALS_UPDATE))
):
    shop_add = await get_shop_additional_or_404(shop_additional_id, db)
    # Проверяем по магазину из базы, а не по параметру запроса: иначе
    # посторонний переименовывал чужой магазин и сменой города выкидывал
    # его товары из выдачи.
    await ensure_can_manage_shop(shop_add.shop_base_id, current_user, db)

    if city_id is not None:
        await verify_city_exists(city_id, db)
        shop_add.city_id = city_id
    if warehouse_type is not None and warehouse_type != shop_add.warehouse_type:
        # Тип склада выбирается один раз, при активации. Сменить его может
        # только сотрудник платформы: от типа зависит, где лежит товар, откуда
        # списываются заказы и какие разделы видит продавец. Продавец раньше
        # переключал его сам запросом, минуя интерфейс, — и остатки, заведённые
        # в одном учёте, пропадали из другого.
        if not is_staff(current_user, *STAFF_SHOPS):
            raise HTTPException(
                status_code=403,
                detail="Warehouse type is changed by platform staff only",
            )
        _check_fbo_allowed(warehouse_type)
        blockers = await warehouse_type_change_blockers(db, shop_add.shop_base_id)
        if blockers:
            raise HTTPException(
                status_code=409,
                detail="Warehouse type can be changed only when the shop has no stock, "
                       "open orders, unfinished returns or draft receipts. Now: " + "; ".join(blockers),
            )
        shop_add.warehouse_type = warehouse_type
    if name is not None:
        shop_add.name = name
    if description is not None:
        shop_add.description = description
    _check_list_limits(addresses, phone_numbers)

    if addresses is not None:
        shop_add.addresses = addresses
    if phone_numbers is not None:
        shop_add.phone_numbers = phone_numbers
    if color is not None:
        shop_add.color = color
    if color_text is not None:
        shop_add.color_text = color_text

    # Старый логотип удаляется после коммита, иначе при неудачной фиксации
    # ссылка в базе указывала бы на уже удалённый файл.
    replaced_logo: str | None = None
    if logo is not None:
        new_logo_path = await process_and_save_logo(logo, shop_add.shop_base_id)
        replaced_logo = shop_add.logo_path
        shop_add.logo_path = new_logo_path

    await db.commit()
    remove_files([replaced_logo])
    return await get_shop_additional_or_404(shop_additional_id, db)
