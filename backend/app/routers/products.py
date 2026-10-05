import os
import json

from pydantic import ValidationError
import uuid
from typing import List, Literal, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File, Form, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import case, select, asc, desc, exists, func, update
from sqlalchemy.orm import selectinload
from decimal import Decimal

from app.database import get_db
from app.core.pagination import limit_param, paginate, skip_param
from app.models.product import Product, DiscountType, ProductStatus
from app.models.product_translation import ProductTranslation
from app.models.category import Category
from app.models.shop_base import ShopBase, RegistrationStatus
from app.models.shop_additional import ShopAdditional
from app.models.city import City
from app.models.user import User
from app.models.brand import Brand
from app.models.measure_unit import MeasureUnit
from app.models.currency import Currency
from app.schemas.product import ProductResponse, ProductTranslationInput, ProductDeclineRequest
from app.schemas.brand import BrandResponse
from app.core.dependencies import require_permissions
from app.core.permissions import Perm
from app.models.notification import NotificationKind
from app.services.notifications import notify
from app.core.ownership import STAFF_SHOPS, is_staff
from app.services.stock import product_has_stock_history
from app.core.visibility import visible_to_customer, shop_public_conditions
from app.core.images import remove_files, check_content_type, process_upload
from app.services.barcode import normalize_vendor_barcode, platform_barcode

SortOption = Literal["most_expensive", "most_cheap", "recently_added", "with_discounts"]


def _effective_price_expr():
    return case(
        (
            (Product.discount_type == DiscountType.percentage) & Product.discount.isnot(None),
            Product.price * (1 - Product.discount / 100),
        ),
        (
            (Product.discount_type == DiscountType.fixed) & Product.discount.isnot(None),
            Product.price - Product.discount,
        ),
        else_=Product.price,
    )


def _validate_pricing(
    price: Optional[Decimal],
    discount_type: Optional[DiscountType],
    discount: Optional[Decimal],
) -> None:
    """Проверяет согласованность итогового состояния цены/скидки.

    Принимает уже разрешённые значения (для update — с учётом существующих).
    """
    if price is not None and price <= 0:
        raise HTTPException(status_code=400, detail="Price must be greater than 0")

    if (discount_type is None) != (discount is None):
        raise HTTPException(
            status_code=400,
            detail="discount and discount_type must be provided together",
        )

    if discount is not None:
        if discount < 0:
            raise HTTPException(status_code=400, detail="Discount cannot be negative")
        if discount_type == DiscountType.percentage and discount > 100:
            raise HTTPException(status_code=400, detail="Percentage discount cannot exceed 100")
        if discount_type == DiscountType.fixed and price is not None and discount >= price:
            raise HTTPException(
                status_code=400,
                detail="Fixed discount must be less than price",
            )


router = APIRouter()

PRODUCT_IMAGES_DIR = "uploads/products"
os.makedirs(PRODUCT_IMAGES_DIR, exist_ok=True)


def _product_query():
    return select(Product).options(
        selectinload(Product.translations),
        selectinload(Product.brand),
        selectinload(Product.currency).selectinload(Currency.translations),
        selectinload(Product.measure_unit).selectinload(MeasureUnit.translations),
    )


async def _expand_category_ids(category_ids: List[int], db: AsyncSession) -> List[int]:
    """Расширяет список категорий их подкатегориями (рекурсивно, на любую глубину).

    Если у переданной категории есть подкатегории — в результат попадут и они,
    иначе возвращается только сама категория.
    """
    all_ids = set(category_ids)
    frontier = set(category_ids)
    while frontier:
        rows = await db.execute(select(Category.id).where(Category.parent_id.in_(frontier)))
        children = set(rows.scalars().all())
        frontier = children - all_ids
        all_ids |= children
    return list(all_ids)





def _in_city_expr(city_id: int):
    """EXISTS-условие: товар относится к городу, если у магазина-владельца есть
    доп. профиль (ShopAdditional) с этим city_id.

    Используем EXISTS вместо JOIN, чтобы фильтр можно было безопасно добавить к
    любому запросу (в т.ч. уже содержащему join по ShopBase) без дублей строк.
    """
    return exists().where(
        (ShopAdditional.shop_base_id == Product.shop_base_id)
        & (ShopAdditional.city_id == city_id)
    )


async def _ensure_can_manage_shop(shop_base_id: int, user: User, db: AsyncSession) -> ShopBase:
    """Проверяет, что пользователь вправе управлять товарами магазина.

    Владелец — только своими магазинами; сотрудник с правом модерации — любыми.
    Возвращает магазин (404, если его нет; 403, если чужой).
    """
    shop = (await db.execute(select(ShopBase).where(ShopBase.id == shop_base_id))).scalar_one_or_none()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop base not found")

    is_staff = any(p.code == Perm.PRODUCTS_MODERATE for p in user.permissions)
    if shop.owner_id != user.id and not is_staff:
        raise HTTPException(status_code=403, detail="You can only manage products of your own shops")
    return shop


def _parse_translations(translations_json: str) -> List[ProductTranslationInput]:
    """Разбирает переводы из multipart-поля.

    Раньше здесь стоял голый `except Exception`, из-за которого любая причина —
    хоть отсутствующее поле description, хоть действительно битый JSON —
    давала одно и то же сообщение «translations must be a valid JSON array».
    Теперь эти случаи различаются, и клиенту видно, чего именно не хватает.
    """
    try:
        data = json.loads(translations_json)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=422,
            detail=f"translations is not valid JSON: {exc.msg} (position {exc.pos})",
        )

    if not isinstance(data, list):
        raise HTTPException(
            status_code=422,
            detail='translations must be a JSON array, e.g. '
                   '[{"language":"ru","name":"...","description":"..."}]',
        )

    try:
        return [ProductTranslationInput(**t) for t in data]
    except TypeError as exc:
        raise HTTPException(status_code=422, detail=f"translations: unexpected item shape ({exc})")
    except ValidationError as exc:
        missing = [
            f"{'.'.join(str(x) for x in err['loc'])} — {err['msg']}"
            for err in exc.errors()
        ]
        raise HTTPException(
            status_code=422,
            detail="translations: " + "; ".join(missing),
        )


async def process_and_save_product_images(files: List[UploadFile]) -> List[str]:
    saved_paths = []
    valid_files = [f for f in files if f.filename and f.size != 0]

    if len(valid_files) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 images allowed")

    for file in valid_files:
        check_content_type(file)
        content = await file.read()
        if not content:
            continue
        filepath = f"{PRODUCT_IMAGES_DIR}/prod_{uuid.uuid4().hex}.webp"
        process_upload(content, filepath, file.filename or "image")
        saved_paths.append(filepath)

    return saved_paths


async def _ensure_vendor_barcode_free(
    db: AsyncSession, shop_id: int, code: str | None, product_id: int | None = None
) -> None:
    """Заводской штрихкод в магазине не повторяется — отвечаем понятно, а не
    ошибкой уникального индекса при коммите."""
    if code is None:
        return
    query = select(Product.id).where(
        Product.shop_base_id == shop_id, Product.vendor_barcode == code
    )
    if product_id is not None:
        query = query.where(Product.id != product_id)
    if (await db.execute(query)).first():
        raise HTTPException(
            status_code=409,
            detail="A product with this barcode already exists in this shop",
        )


async def _with_shop_names(db: AsyncSession, products: list[Product]) -> list[ProductResponse]:
    """Ответ с названиями магазинов — модератору нужно имя, а не номер."""
    shop_ids = {p.shop_base_id for p in products}
    names: dict[int, str | None] = {}
    if shop_ids:
        rows = await db.execute(
            select(ShopAdditional.shop_base_id, ShopAdditional.name)
            .where(ShopAdditional.shop_base_id.in_(shop_ids))
        )
        names = {shop_id: name for shop_id, name in rows.all()}
    return [
        ProductResponse.model_validate(p).model_copy(update={"shop_name": names.get(p.shop_base_id)})
        for p in products
    ]


async def get_product_or_404(product_id: int, db: AsyncSession) -> Product:
    result = await db.execute(_product_query().where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    category_id:     int = Form(...),
    shop_base_id:    int = Form(...),
    measure_unit_id: int = Form(...),
    brand_id:        Optional[int] = Form(None),
    translations:    str = Form(..., description='JSON: [{"language":"ru","name":"...","description":"..."}]'),
    hashtag:         Optional[str] = Form(None),
    vendor_barcode:  Optional[str] = Form(None, description="Заводской штрихкод: 8, 12, 13 или 14 цифр"),
    price:           Decimal = Form(...),
    currency_id:     Optional[int] = Form(None),
    discount_type:   Optional[DiscountType] = Form(None),
    discount:        Optional[Decimal] = Form(None),
    images:          List[UploadFile] = File(None, description="До 5 изображений (будут сконвертированы в WEBP)"),
    db:              AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.PRODUCTS_CREATE))
):
    parsed_translations = _parse_translations(translations)
    if not parsed_translations:
        raise HTTPException(status_code=400, detail="At least one translation is required")

    _validate_pricing(price, discount_type, discount)
    vendor_code = normalize_vendor_barcode(vendor_barcode)

    cat_res = await db.execute(select(Category).where(Category.id == category_id))
    if not cat_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Category not found")

    await _ensure_can_manage_shop(shop_base_id, current_user, db)
    await _ensure_vendor_barcode_free(db, shop_base_id, vendor_code)

    mu_res = await db.execute(select(MeasureUnit).where(MeasureUnit.id == measure_unit_id))
    if not mu_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Measure unit not found")

    if brand_id is not None:
        brand_res = await db.execute(select(Brand).where(Brand.id == brand_id))
        if not brand_res.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Brand not found")

    # Валюта — единственный справочник, который не проверялся: неизвестный
    # currency_id доходил до коммита и всплывал ошибкой внешнего ключа, то есть
    # 500 вместо понятного 404, как у категории, единицы измерения и бренда.
    if currency_id is not None:
        cur_res = await db.execute(select(Currency).where(Currency.id == currency_id))
        if not cur_res.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Currency not found")

    saved_images = []
    if images:
        saved_images = await process_and_save_product_images(images)

    product = Product(
        category_id=category_id,
        shop_base_id=shop_base_id,
        brand_id=brand_id,
        measure_unit_id=measure_unit_id,
        hashtag=hashtag,
        vendor_barcode=vendor_code,
        price=price,
        currency_id=currency_id,
        discount_type=discount_type,
        discount=discount,
        images=saved_images,
        status=ProductStatus.pending,
    )
    db.add(product)
    await db.flush()
    # Штрихкод Postshop строится из номера, а номер известен только после flush.
    product.barcode = platform_barcode(product.id)

    for t in parsed_translations:
        db.add(ProductTranslation(product_id=product.id, language=t.language, name=t.name, description=t.description))

    await db.commit()
    return await get_product_or_404(product.id, db)


@router.get("/", response_model=list[ProductResponse])
async def get_products(
    response: Response = None,  # type: ignore[assignment]
    skip: int = skip_param(),
    limit: int = limit_param(20),
    name: Optional[str] = Query(default=None, description="Фильтр по части имени продукта (поиск по переводам)"),
    category_ids: Optional[List[int]] = Query(default=None),
    shop_base_ids: Optional[List[int]] = Query(default=None),
    brand_ids: Optional[List[int]] = Query(default=None),
    city_id: Optional[int] = Query(default=None, description="Фильтр по городу магазина-владельца"),
    price_from: Optional[Decimal] = Query(default=None),
    price_to: Optional[Decimal] = Query(default=None),
    sort: Optional[SortOption] = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    query = await visible_to_customer(_product_query(), db)

    if name:
        name_filter = exists().where(
            (ProductTranslation.product_id == Product.id)
            & ProductTranslation.name.ilike(f"%{name}%")
        )
        query = query.where(name_filter)
    if city_id is not None:
        query = query.where(_in_city_expr(city_id))
    if category_ids:
        expanded_category_ids = await _expand_category_ids(category_ids, db)
        query = query.where(Product.category_id.in_(expanded_category_ids))
    if shop_base_ids:
        query = query.where(Product.shop_base_id.in_(shop_base_ids))
    if brand_ids:
        query = query.where(Product.brand_id.in_(brand_ids))

    if price_from is not None or price_to is not None:
        ep = _effective_price_expr()
        if price_from is not None:
            query = query.where(ep >= price_from)
        if price_to is not None:
            query = query.where(ep <= price_to)

    if sort == "most_expensive":
        query = query.order_by(desc(_effective_price_expr()))
    elif sort == "most_cheap":
        query = query.order_by(asc(_effective_price_expr()))
    elif sort == "recently_added":
        query = query.order_by(desc(Product.created_at))
    elif sort == "with_discounts":
        has_discount = case(
            (Product.discount.isnot(None) & Product.discount_type.isnot(None), 1),
            else_=0,
        )
        query = query.order_by(desc(has_discount))

    result = await db.execute(await paginate(db, response, query, skip=skip, limit=limit))
    return list(result.scalars().all())


@router.get("/my", response_model=list[ProductResponse])
async def get_my_products(
    response: Response = None,  # type: ignore[assignment]
    skip: int = skip_param(),
    limit: int = limit_param(20),
    shop_base_id: Optional[int] = Query(default=None, description="Фильтр по конкретному магазину владельца (по умолчанию — все его магазины)"),
    status: Optional[ProductStatus] = Query(default=None, description="Фильтр по статусу модерации (по умолчанию — все)"),
    city_id: Optional[int] = Query(default=None, description="Фильтр по городу магазина-владельца"),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_permissions(Perm.PRODUCTS_READ)),
):
    """«Мои товары» владельца: товары его магазинов в любом статусе (включая pending/declined).

    Если передан `shop_base_id` — возвращаются товары только этого магазина (при условии,
    что он принадлежит текущему пользователю).
    """
    query = (
        _product_query()
        .join(ShopBase, Product.shop_base_id == ShopBase.id)
        .where(ShopBase.owner_id == current_user.id)
        .order_by(desc(Product.created_at))
    )
    if shop_base_id is not None:
        shop = (
            await db.execute(
                select(ShopBase).where(
                    ShopBase.id == shop_base_id,
                    ShopBase.owner_id == current_user.id,
                )
            )
        ).scalar_one_or_none()
        if not shop:
            raise HTTPException(status_code=404, detail="Shop base not found")
        query = query.where(Product.shop_base_id == shop_base_id)
    if status is not None:
        query = query.where(Product.status == status)
    if city_id is not None:
        query = query.where(_in_city_expr(city_id))
    result = await db.execute(await paginate(db, response, query, skip=skip, limit=limit))
    return list(result.scalars().all())


@router.get("/moderation/count")
async def get_moderation_count(
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.PRODUCTS_MODERATE)),
):
    """Количество товаров, ожидающих модерации (status = pending)."""
    result = await db.execute(
        select(func.count())
        .select_from(Product)
        .where(Product.status == ProductStatus.pending)
    )
    return {"count": result.scalar_one()}


@router.get("/moderation", response_model=list[ProductResponse])
async def get_moderation_queue(
    response: Response = None,  # type: ignore[assignment]
    skip: int = skip_param(),
    limit: int = limit_param(20),
    status: ProductStatus = Query(default=ProductStatus.pending, description="Фильтр по статусу модерации"),
    city_id: Optional[int] = Query(default=None, description="Фильтр по городу магазина-владельца"),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.PRODUCTS_MODERATE)),
):
    """Очередь модерации (для администратора): товары по статусу, без скрытия немодерированных."""
    query = _product_query().where(Product.status == status).order_by(asc(Product.created_at))
    if city_id is not None:
        query = query.where(_in_city_expr(city_id))
    result = await db.execute(await paginate(db, response, query, skip=skip, limit=limit))
    return await _with_shop_names(db, list(result.scalars().all()))


@router.get("/moderation/{product_id}", response_model=ProductResponse)
async def get_product_for_moderation(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.PRODUCTS_MODERATE)),
):
    """Полная информация о товаре для администратора — в любом статусе и вне зависимости от активности."""
    result = await db.execute(_product_query().where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return (await _with_shop_names(db, [product]))[0]


@router.get("/brands", response_model=list[BrandResponse])
async def get_brands_by_category_and_city(
    category_id: int = Query(..., description="ID категории (учитываются и её подкатегории)"),
    city_id: int = Query(..., description="ID города"),
    db: AsyncSession = Depends(get_db),
):
    """Уникальные бренды, у которых есть видимые товары в данной категории и городе."""
    if (await db.execute(select(Category.id).where(Category.id == category_id))).scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Category not found")
    if (await db.execute(select(City.id).where(City.id == city_id))).scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="City not found")

    category_ids = await _expand_category_ids([category_id], db)

    query = (
        select(Brand)
        .join(Product, Product.brand_id == Brand.id)
        .join(ShopBase, Product.shop_base_id == ShopBase.id)
        .join(ShopAdditional, ShopAdditional.shop_base_id == ShopBase.id)
        .where(
            Product.category_id.in_(category_ids),
            Product.is_active.is_(True),
            Product.status == ProductStatus.approved,
            *shop_public_conditions(),
            ShopAdditional.city_id == city_id,
        )
        .distinct()
        .order_by(Brand.name)
    )
    result = await db.execute(query)
    return list(result.scalars().all())


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
):
    visible = await visible_to_customer(_product_query(), db)
    result = await db.execute(visible.where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Просмотр засчитывается здесь: это единственное место, где открывают
    # именно карточку товара, а не список. Считаем через UPDATE, а не через
    # чтение-и-запись: карточку популярного товара открывают параллельно, и
    # присвоение product.views_count + 1 теряло бы часть просмотров.
    #
    # Скрытый товар сюда не доходит вовсе, поэтому счётчик растёт только у
    # того, что покупатель реально видел.
    # synchronize_session=False обязателен: по умолчанию ORM синхронизирует
    # сессию с этим UPDATE и сбрасывает уже загруженный экземпляр товара. При
    # сборке ответа он полез бы в базу за сброшенными полями — вне контекста
    # greenlet, то есть 500 на каждой карточке товара. Значение в памяти
    # остаётся прежним, но мы его и не отдаём.
    await db.execute(
        update(Product)
        .where(Product.id == product_id)
        .values(views_count=Product.views_count + 1)
        .execution_options(synchronize_session=False)
    )
    await db.commit()
    return product


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id:      int,
    category_id:     Optional[int] = Form(None),
    measure_unit_id: Optional[int] = Form(None),
    translations:    Optional[str] = Form(None, description='JSON: [{"language":"ru","name":"...","description":"..."}]'),
    brand_id:        Optional[int] = Form(None),
    hashtag:         Optional[str] = Form(None),
    vendor_barcode:  Optional[str] = Form(None, description="Заводской штрихкод (8, 12, 13 или 14 цифр)"),
    remove_vendor_barcode: bool = Form(False, description="Убрать заводской штрихкод"),
    price:           Optional[Decimal] = Form(None),
    currency_id:     Optional[int] = Form(None),
    discount_type:   Optional[DiscountType] = Form(None),
    discount:        Optional[Decimal] = Form(None),
    remove_discount: bool = Form(False, description="Убрать скидку (обнулит discount и discount_type)"),
    images:          List[UploadFile] = File(None, description="Полностью заменят старые изображения"),
    db:              AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.PRODUCTS_UPDATE))
):
    product = await get_product_or_404(product_id, db)
    await _ensure_can_manage_shop(product.shop_base_id, current_user, db)

    # Изменилось ли то, что проверяет модератор: название, описание, фото,
    # категория, бренд, единица, тег. Цена, скидка, валюта и штрихкод на
    # модерацию не отправляют — см. конец метода.
    content_changed = False

    if category_id is not None:
        cat_res = await db.execute(select(Category).where(Category.id == category_id))
        if not cat_res.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Category not found")
        content_changed |= product.category_id != category_id
        product.category_id = category_id

    if measure_unit_id is not None:
        mu_res = await db.execute(select(MeasureUnit).where(MeasureUnit.id == measure_unit_id))
        if not mu_res.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Measure unit not found")
        # Остаток и заказы записаны в прежней единице: смена смешала бы их в
        # одном балансе.
        if (
            product.measure_unit_id != measure_unit_id
            and await product_has_stock_history(db, product.id)
        ):
            raise HTTPException(
                status_code=409,
                detail="Measure unit cannot be changed: the product already has "
                       "stock movements or orders in the current unit",
            )
        content_changed |= product.measure_unit_id != measure_unit_id
        product.measure_unit_id = measure_unit_id

    if brand_id is not None:
        brand_res = await db.execute(select(Brand).where(Brand.id == brand_id))
        if not brand_res.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Brand not found")
        content_changed |= product.brand_id != brand_id
        product.brand_id = brand_id

    if translations is not None:
        parsed_translations = _parse_translations(translations)
        existing = {t.language: t for t in product.translations}
        for t in parsed_translations:
            if t.language in existing:
                current = existing[t.language]
                content_changed |= (current.name, current.description) != (t.name, t.description)
                current.name = t.name
                current.description = t.description
            else:
                content_changed = True
                db.add(ProductTranslation(product_id=product.id, language=t.language, name=t.name, description=t.description))

    if remove_discount and (discount_type is not None or discount is not None):
        raise HTTPException(
            status_code=400,
            detail="Cannot set discount and remove_discount at the same time",
        )

    if remove_discount:
        resolved_discount_type = None
        resolved_discount = None
    else:
        resolved_discount_type = discount_type if discount_type is not None else product.discount_type
        resolved_discount = discount if discount is not None else product.discount

    _validate_pricing(
        price if price is not None else product.price,
        resolved_discount_type,
        resolved_discount,
    )

    if hashtag is not None:
        product.hashtag = hashtag
    # Пустое поле формы FastAPI считает непереданным, поэтому «стереть» —
    # отдельным флагом, как у скидки (remove_discount).
    if remove_vendor_barcode:
        product.vendor_barcode = None
    elif vendor_barcode is not None:
        vendor_code = normalize_vendor_barcode(vendor_barcode)
        if vendor_code != product.vendor_barcode:
            await _ensure_vendor_barcode_free(db, product.shop_base_id, vendor_code, product.id)
        product.vendor_barcode = vendor_code
    if price is not None:
        product.price = price
    if currency_id is not None:
        cur_res = await db.execute(select(Currency).where(Currency.id == currency_id))
        if not cur_res.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Currency not found")
        product.currency_id = currency_id

    if remove_discount:
        product.discount_type = None
        product.discount = None
    else:
        if discount_type is not None:
            product.discount_type = discount_type
        if discount is not None:
            product.discount = discount

    # Старые файлы стираются после коммита: при неудачной фиксации в базе
    # остались бы ссылки на уже удалённые изображения.
    replaced_images: list[str] = []
    if images is not None and len(images) > 0 and images[0].filename:
        saved_images = await process_and_save_product_images(images)
        replaced_images = list(product.images or [])
        product.images = saved_images
        content_changed = True

    # Правка владельца отправляет товар на повторную модерацию, правка
    # сотрудника — нет. Раньше сбрасывался статус у любой правки, поэтому
    # исправление опечатки модератором убирало одобренный товар из каталога
    # и отправляло его в очередь к самому же модератору.
    #
    # И только правка содержимого. Продавец менял цену — и товар пропадал из
    # каталога до модерации; сохранение без изменений делало то же самое.
    # Цену, скидку и штрихкод модератор не проверяет, и снимать за них товар
    # с продажи незачем.
    if content_changed and not is_staff(current_user, Perm.PRODUCTS_MODERATE):
        product.status = ProductStatus.pending
        product.moderation_comment = None

    await db.commit()
    remove_files(replaced_images)
    return await get_product_or_404(product_id, db)


@router.patch("/{product_id}/block", response_model=ProductResponse)
async def block_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.PRODUCTS_BLOCK))
):
    """Снять товар с продажи. Владелец снимает свой, сотрудник — любой.

    Снятие сотрудником помечается: вернуть такой товар владелец не может, и
    ему приходит уведомление — раньше товар просто пропадал из каталога.
    """
    product = await get_product_or_404(product_id, db)
    shop = await _ensure_can_manage_shop(product.shop_base_id, current_user, db)
    if not product.is_active:
        raise HTTPException(status_code=400, detail="Product is already blocked")
    by_staff = is_staff(current_user, *STAFF_SHOPS) and current_user.id != shop.owner_id
    product.is_active = False
    product.blocked_by_staff = by_staff
    if by_staff:
        await notify(
            db,
            user_id=shop.owner_id,
            kind=NotificationKind.product_blocked,
            entity_id=product.id,
        )
    await db.commit()
    return await get_product_or_404(product_id, db)


@router.patch("/{product_id}/unblock", response_model=ProductResponse)
async def unblock_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.PRODUCTS_BLOCK))
):
    product = await get_product_or_404(product_id, db)
    await _ensure_can_manage_shop(product.shop_base_id, current_user, db)
    if product.is_active:
        raise HTTPException(status_code=400, detail="Product is already active")
    # Снятое платформой владелец не возвращает: иначе блокировка сотрудника
    # снималась одним запросом.
    if product.blocked_by_staff and not is_staff(current_user, *STAFF_SHOPS):
        raise HTTPException(
            status_code=403,
            detail="The product was blocked by the platform; only platform staff can unblock it",
        )
    product.is_active = True
    product.blocked_by_staff = False
    await db.commit()
    return await get_product_or_404(product_id, db)


# Модерация товара шла без правил: declined → approved и обратно менялись
# свободно, в обход очереди. Таблица повторяет ту, что уже есть у регистрации
# магазина (ALLOWED_STATUS_TRANSITIONS в shop_bases.py).
ALLOWED_MODERATION_TRANSITIONS = {
    ProductStatus.pending: {ProductStatus.approved, ProductStatus.declined},
    # Одобренный товар возвращается в очередь только правкой владельца, а
    # отклонённый — только повторной отправкой. Прямо между собой они не ходят.
    ProductStatus.approved: set(),
    ProductStatus.declined: set(),
}


def _ensure_moderation_transition(current: ProductStatus, target: ProductStatus) -> None:
    if target not in ALLOWED_MODERATION_TRANSITIONS.get(current, set()):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot change moderation status from '{current.value}' to '{target.value}'",
        )


async def _shop_owner_id(db: AsyncSession, shop_base_id: int) -> int | None:
    """Кому адресовать уведомление о товаре — владельцу магазина."""
    result = await db.execute(select(ShopBase.owner_id).where(ShopBase.id == shop_base_id))
    return result.scalar_one_or_none()


@router.patch("/{product_id}/approve", response_model=ProductResponse)
async def approve_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.PRODUCTS_MODERATE))
):
    product = await get_product_or_404(product_id, db)
    if product.status == ProductStatus.approved:
        raise HTTPException(status_code=400, detail="Product is already approved")
    _ensure_moderation_transition(product.status, ProductStatus.approved)
    product.status = ProductStatus.approved
    product.moderation_comment = None
    # Владелец магазина иначе узнаёт о решении только зайдя и проверив: товар
    # неделю лежал непроверенным, и понять, прошёл он или нет, было негде.
    await notify(
        db,
        user_id=await _shop_owner_id(db, product.shop_base_id),
        kind=NotificationKind.product_approved,
        entity_id=product.id,
    )
    await db.commit()
    return await get_product_or_404(product_id, db)


@router.patch("/{product_id}/decline", response_model=ProductResponse)
async def decline_product(
    product_id: int,
    payload: ProductDeclineRequest = ProductDeclineRequest(),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.PRODUCTS_MODERATE))
):
    product = await get_product_or_404(product_id, db)
    if product.status == ProductStatus.declined:
        raise HTTPException(status_code=400, detail="Product is already declined")
    _ensure_moderation_transition(product.status, ProductStatus.declined)
    product.status = ProductStatus.declined
    product.moderation_comment = payload.moderation_comment
    # Причина отказа существовала в базе, но до продавца не доходила.
    await notify(
        db,
        user_id=await _shop_owner_id(db, product.shop_base_id),
        kind=NotificationKind.product_declined,
        entity_id=product.id,
        comment=product.moderation_comment,
    )
    await db.commit()
    return await get_product_or_404(product_id, db)


@router.get("/{product_id}/similar", response_model=list[ProductResponse])
async def get_similar_products(
    product_id: int,
    city_id: Optional[int] = Query(default=None, description="Фильтр по городу магазина-владельца"),
    db: AsyncSession = Depends(get_db),
):
    # Исходный товар искался в обход правила видимости, поэтому у скрытого
    # товара метод отвечал 200 и тем самым подтверждал его существование.
    visible = await visible_to_customer(select(Product), db)
    base_res = await db.execute(visible.where(Product.id == product_id))
    product = base_res.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    cat_result = await db.execute(select(Category).where(Category.id == product.category_id))
    category = cat_result.scalar_one_or_none()
    parent_id = category.parent_id if category else None

    price = Decimal(str(product.price))
    price_low = price * Decimal("0.7")
    price_high = price * Decimal("1.3")

    score = (
        case((Product.category_id == product.category_id, 4), else_=0)
        + case((Product.shop_base_id == product.shop_base_id, 1), else_=0)
        + case(
            ((Product.price >= price_low) & (Product.price <= price_high), 2),
            else_=0,
        )
    )

    if parent_id is not None:
        sibling_subq = select(Category.id).where(
            (Category.parent_id == parent_id) & (Category.id != product.category_id)
        )
        score = score + case((Product.category_id.in_(sibling_subq), 2), else_=0)

    if product.brand_id is not None:
        score = score + case((Product.brand_id == product.brand_id, 3), else_=0)

    if product.hashtag:
        score = score + case((Product.hashtag == product.hashtag, 1), else_=0)

    query = (
        (await visible_to_customer(_product_query(), db))
        .where(Product.id != product_id)
        .order_by(desc(score), desc(Product.created_at))
        .limit(8)
    )
    if city_id is not None:
        query = query.where(_in_city_expr(city_id))

    result = await db.execute(query)
    return list(result.scalars().all())
