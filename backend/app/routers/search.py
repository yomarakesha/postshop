from decimal import Decimal
from typing import List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy import and_, select, asc, desc, case, exists, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.core.visibility import shop_public_conditions
from app.core.pagination import limit_param, paginate, skip_param
from app.models.brand import Brand
from app.models.category import Category
from app.models.category_translation import CategoryTranslation
from app.models.city import City
from app.models.currency import Currency
from app.models.measure_unit import MeasureUnit
from app.models.product import Product, ProductStatus
from app.models.product_translation import ProductTranslation
from app.models.region import Region
from app.models.shop_additional import ShopAdditional
from app.models.shop_base import ShopBase, RegistrationStatus
from app.routers.products import _effective_price_expr
from app.schemas.product import ProductResponse
from app.schemas.search import SearchResponse

router = APIRouter()

SearchSort = Literal["relevance", "price_asc", "price_desc", "newest", "discounts"]

SUGGEST_LIMIT = 10  # сколько магазинов/категорий/брендов отдавать в подсказках


def _has_discount_expr():
    return Product.discount.isnot(None) & Product.discount_type.isnot(None)


# Больше слов в запросе — уже не поиск, а перечисление; хвост отбрасываем,
# чтобы одно обращение не разворачивалось в десятки EXISTS.
def literal_zero():
    """Ноль как выражение: sum() без начального значения даёт int, а его
    нельзя складывать с case-ами SQLAlchemy."""
    return case((Product.id.is_(None), 1), else_=0)


MAX_QUERY_TOKENS = 6
# Односимвольный токен совпадает почти со всем и только размывает выдачу.
MIN_TOKEN_LEN = 2


def _local_bonus(city_id: int | None):
    """Вес за «магазин в городе покупателя».

    Город был жёстким фильтром: товары других городов из поиска исчезали
    совсем — при том, что главная страница и коллекции их показывали. Человек
    видел товар на витрине и не мог его найти.

    Теперь город — сильный сигнал ранжирования, а не отсечка: местное идёт
    первым, остальное следом и с пометкой о доставке. Вес выше любого
    текстового: при прочих равных местный товар всегда впереди.
    """
    if city_id is None:
        return literal_zero()
    # ShopAdditional уже присоединён к запросу товаров, поэтому сравниваем
    # напрямую. EXISTS здесь не нужен и вреден: подзапрос без собственного
    # FROM автокоррелирует обе таблицы и разваливается.
    return case((ShopAdditional.city_id == city_id, 30), else_=0)


def _tokens(term: str) -> list[str]:
    """Слова запроса без пустых и без решёток у тегов."""
    return [t.lstrip("#") for t in term.split() if t.strip()][:MAX_QUERY_TOKENS]


def _name_match(text: str):
    return exists().where(
        (ProductTranslation.product_id == Product.id) & ProductTranslation.name.ilike(text)
    )


def _desc_match(text: str):
    return exists().where(
        (ProductTranslation.product_id == Product.id)
        & ProductTranslation.description.ilike(text)
    )


def _brand_match(text: str):
    return exists().where((Brand.id == Product.brand_id) & Brand.name.ilike(text))


def _token_match_expr(token: str):
    """Товар подходит под одно слово запроса: имя, описание, бренд или тег.

    Раньше вся строка запроса шла в один `%…%`, поэтому порядок слов был
    важнее смысла: «nusay lite» находило товар, а «lite 14 nusay» — уже нет,
    хотя речь об одном и том же. Теперь совпасть должно каждое слово, а вот
    где именно — неважно.
    """
    like = f"%{token}%"
    match = _name_match(like) | _desc_match(like) | _brand_match(like)
    if len(token) >= MIN_TOKEN_LEN:
        match = match | Product.hashtag.ilike(like)
    # Штрихкод — точным совпадением: его сканируют или вводят целиком, а
    # частичное совпадение цифр находило бы случайные товары.
    if token.isdigit() and len(token) >= 8:
        match = match | (Product.barcode == token) | (Product.vendor_barcode == token)
    return match


def _sellable_product_exists(match):
    """EXISTS: есть продаваемый товар (активный, из активного одобренного
    магазина), удовлетворяющий `match` — например, Product.category_id == Category.id.

    Город здесь больше не проверяется: подсказки обязаны соответствовать
    выдаче, а выдача городом не ограничена. Иначе получалось бы, что товар в
    списке есть, а его категории в подсказках нет.
    """
    return (
        select(Product.id)
        .join(ShopBase, Product.shop_base_id == ShopBase.id)
        .where(
            match,
            Product.is_active.is_(True),
            Product.status == ProductStatus.approved,
            *shop_public_conditions(),
        )
        .exists()
    )


@router.get("/", response_model=SearchResponse)
async def search(
    city_id:      Optional[int] = Query(
        default=None,
        description="Город покупателя. Не сужает выдачу — поднимает местные товары выше",
    ),
    q:            Optional[str] = Query(default=None, description="Поисковая строка"),
    category_ids: Optional[List[int]] = Query(default=None),
    brand_ids:    Optional[List[int]] = Query(default=None),
    shop_ids:     Optional[List[int]] = Query(default=None),
    price_from:   Optional[Decimal] = Query(default=None),
    price_to:     Optional[Decimal] = Query(default=None),
    has_discount: Optional[bool] = Query(default=None),
    sort:         SearchSort = Query(default="relevance"),
    response:     Response = None,  # type: ignore[assignment]
    skip:         int = skip_param(),
    limit:        int = limit_param(),
    db: AsyncSession = Depends(get_db),
):
    """Общий поиск по маркетплейсу в рамках города.

    Возвращает товары (с фильтрами, релевантностью и пагинацией) и — если задан
    `q` — короткие подсказки: магазины города по названию, категории и бренды.
    """
    # Город необязателен: раньше без него поиск не работал вовсе, а витрина
    # выбирала город за человека, не спрашивая.
    if city_id is not None:
        if (await db.execute(select(City.id).where(City.id == city_id))).scalar_one_or_none() is None:
            raise HTTPException(status_code=404, detail="City not found")

    term = q.strip() if q else None
    like = f"%{term}%" if term else None

    # ── Товары: активные, из активных одобренных магазинов (город — вес, не фильтр) ──
    pq = (
        select(Product)
        .join(ShopBase, Product.shop_base_id == ShopBase.id)
        .join(ShopAdditional, ShopAdditional.shop_base_id == ShopBase.id)
        .where(
            Product.is_active.is_(True),
            Product.status == ProductStatus.approved,
            *shop_public_conditions(),
        )
        .options(
            selectinload(Product.translations),
            selectinload(Product.brand),
            selectinload(Product.currency).selectinload(Currency.translations),
            selectinload(Product.measure_unit).selectinload(MeasureUnit.translations),
        )
    )

    if category_ids:
        pq = pq.where(Product.category_id.in_(category_ids))
    if brand_ids:
        pq = pq.where(Product.brand_id.in_(brand_ids))
    if shop_ids:
        pq = pq.where(Product.shop_base_id.in_(shop_ids))

    if price_from is not None or price_to is not None:
        ep = _effective_price_expr()
        if price_from is not None:
            pq = pq.where(ep >= price_from)
        if price_to is not None:
            pq = pq.where(ep <= price_to)

    if has_discount is True:
        pq = pq.where(_has_discount_expr())
    elif has_discount is False:
        pq = pq.where(~_has_discount_expr())

    # Текстовый запрос: совпадение по названию/описанию (перевод), хэштегу,
    # названию бренда или названию магазина.
    name_match = desc_match = brand_match = hashtag_match = None
    tokens: list[str] = []
    if like is not None:
        tokens = _tokens(term)
        name_match = _name_match(like)
        desc_match = _desc_match(like)
        brand_match = _brand_match(like)
        hashtag_match = Product.hashtag.ilike(like)

        # Совпасть должно каждое слово запроса — иначе добавление уточняющего
        # слова не сужало выдачу, а меняло её на другую.
        #
        # Названия магазина среди полей нет намеренно: совпадение по нему
        # вываливало в товары весь каталог продавца (запрос «sahra» — 49
        # товаров, большинство к запросу отношения не имеет). Магазины у поиска
        # и так есть отдельным разделом.
        pq = pq.where(and_(*[_token_match_expr(tok) for tok in tokens]))

    # ── Сортировка ──
    if sort == "price_asc":
        pq = pq.order_by(asc(_effective_price_expr()))
    elif sort == "price_desc":
        pq = pq.order_by(desc(_effective_price_expr()))
    elif sort == "discounts":
        pq = pq.order_by(desc(case((_has_discount_expr(), 1), else_=0)), desc(Product.created_at))
    elif sort == "relevance" and like is not None:
        # Раньше любое совпадение в названии давало ровно 5, поэтому внутри
        # выдачи всё решала дата: товар с точным названием стоял ниже
        # случайного, если тот новее. Теперь точное совпадение и совпадение с
        # начала названия весят больше простого вхождения, а многословный
        # запрос вознаграждает того, у кого в названии больше его слов.
        exact_name = _name_match(term)
        prefix_name = _name_match(f"{term}%")
        name_tokens_hit = sum(
            (case((_name_match(f"%{tok}%"), 1), else_=0) for tok in tokens),
            literal_zero(),
        )

        score = (
            _local_bonus(city_id)
            + case((exact_name, 12), else_=0)
            + case((prefix_name, 8), else_=0)
            + case((name_match, 5), else_=0)
            + name_tokens_hit * 3
            + case((brand_match, 3), else_=0)
            + case((hashtag_match, 2), else_=0)
            + case((desc_match, 1), else_=0)
        )
        # id в конце — устойчивый порядок: при равных дате и весе строки иначе
        # переставлялись между страницами, и одна и та же запись показывалась
        # дважды или не показывалась вовсе.
        pq = pq.order_by(desc(score), desc(Product.created_at), desc(Product.id))
    else:  # newest, либо relevance без запроса
        pq = pq.order_by(desc(_local_bonus(city_id)), desc(Product.created_at), desc(Product.id))

    paged = await paginate(db, response, pq, skip=skip, limit=limit)
    products = (await db.execute(paged)).scalars().all()

    # Город магазина — витрине, чтобы отметить товар, который приедет из
    # другого города. Одним запросом на всю страницу, а не по товару.
    product_models: list[ProductResponse] = []
    if products:
        city_rows = await db.execute(
            select(ShopAdditional.shop_base_id, ShopAdditional.city_id).where(
                ShopAdditional.shop_base_id.in_({p.shop_base_id for p in products})
            )
        )
        city_of_shop = dict(city_rows.all())
        for product in products:
            model = ProductResponse.model_validate(product)
            model.shop_city_id = city_of_shop.get(product.shop_base_id)
            product_models.append(model)

    # ── Подсказки (только при наличии запроса) ──
    shops = categories = brands = []
    if like is not None:
        shops_res = await db.execute(
            select(ShopBase)
            .join(ShopAdditional, ShopAdditional.shop_base_id == ShopBase.id)
            .where(
                *shop_public_conditions(),
                ShopAdditional.name.ilike(like),
            )
            .options(
                selectinload(ShopBase.additional)
                .selectinload(ShopAdditional.city)
                .options(
                    selectinload(City.translations),
                    selectinload(City.region).selectinload(Region.translations),
                )
            )
            .limit(SUGGEST_LIMIT)
        )
        shops = shops_res.scalars().all()

        cats_res = await db.execute(
            select(Category)
            .where(
                Category.is_active.is_(True),
                exists().where(
                    (CategoryTranslation.category_id == Category.id)
                    & CategoryTranslation.name.ilike(like)
                ),
                _sellable_product_exists(Product.category_id == Category.id),
            )
            .options(selectinload(Category.translations))
            .limit(SUGGEST_LIMIT)
        )
        categories = cats_res.scalars().all()

        brands_res = await db.execute(
            select(Brand)
            .where(
                Brand.is_active.is_(True),
                Brand.name.ilike(like),
                _sellable_product_exists(Product.brand_id == Brand.id),
            )
            .limit(SUGGEST_LIMIT)
        )
        brands = brands_res.scalars().all()

    return SearchResponse(
        products=product_models,
        shops=shops,
        categories=categories,
        brands=brands,
    )
