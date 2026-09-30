"""
Единое правило «товар виден покупателю».

До этого правило существовало в двух несовместимых версиях. Поиск
(`app/routers/search.py`) и выдача брендов проверяли и товар, и магазин:
активность, статус модерации, `ShopBase.is_active`, одобренную регистрацию.
Основной каталог и карточка товара смотрели только на поля самого товара —
поэтому заблокированный магазин продолжал торговать: его товары оставались
в каталоге, добавлялись в корзину и покупались. Категорию не проверял никто.

Здесь правило одно, и оно применяется во всех местах, где покупатель видит
или покупает товар: каталог, карточка, похожие товары, коллекции, корзина,
избранное, оформление заказа.
"""

from typing import Iterable

from sqlalchemy import exists, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from app.models.category import Category
from app.models.product import Product, ProductStatus
from app.models.shop_additional import ShopAdditional
from app.models.shop_base import ShopBase, RegistrationStatus


def shop_profile_ready_expr(shop_id_column):
    """
    EXISTS-условие: продавец заполнил витрину магазина — есть название и логотип.

    Регистрацию одобряет администратор, а данные магазина продавец заполняет
    уже после. Одобренный, но не заполненный магазин показывался покупателям
    пустой карточкой без имени и картинки — вместе со своими товарами.
    """
    # Свой алиас: запросы, где ShopAdditional уже присоединён (поиск, список
    # магазинов), иначе «съедали» таблицу подзапроса автокорреляцией.
    profile = aliased(ShopAdditional)
    return exists(
        select(profile.id).where(
            profile.shop_base_id == shop_id_column,
            profile.name.is_not(None),
            profile.name != "",
            profile.logo_path.is_not(None),
            profile.logo_path != "",
        )
    )


def shop_public_conditions(shop=ShopBase):
    """Магазин виден покупателю: открыт, одобрен, витрина заполнена.

    `shop` — ShopBase или его алиас: в подзапросе к запросу, где ShopBase уже
    присоединён, нужен алиас, иначе таблицу поглотит автокорреляция.
    """
    return (
        shop.is_active.is_(True),
        shop.registration_status == RegistrationStatus.approved,
        shop_profile_ready_expr(shop.id),
    )


def shop_visible_expr():
    """
    EXISTS-условие: магазин-владелец товара открыт, прошёл регистрацию и
    заполнил витрину.

    Сделано через EXISTS, а не JOIN, чтобы условие можно было навесить на любой
    запрос по Product, не меняя его состав строк и не рискуя дублями.
    """
    return exists(
        select(ShopBase.id).where(
            ShopBase.id == Product.shop_base_id,
            *shop_public_conditions(),
        )
    )


async def visible_category_ids(db: AsyncSession) -> set[int]:
    """
    Категории, у которых активна и сама категория, и все её родители.

    Блокировка категории раньше действовала на один уровень: заблокировали
    раздел — его подкатегории остались доступны вместе с товарами. Обход идёт
    в Python, а не рекурсивным запросом, по двум причинам: категорий десятки,
    и дерево может оказаться замкнутым в цикл (это отдельная находка), а цикл
    рекурсивный CTE не переживёт.
    """
    rows = await db.execute(select(Category.id, Category.parent_id, Category.is_active))
    nodes = {cid: (parent_id, bool(is_active)) for cid, parent_id, is_active in rows.all()}

    visible: set[int] = set()
    for start in nodes:
        node = start
        seen: set[int] = set()
        ok = True
        while node is not None and node not in seen:
            seen.add(node)
            entry = nodes.get(node)
            if entry is None or not entry[1]:
                # Родителя нет в таблице или он заблокирован.
                ok = False
                break
            node = entry[0]
        if ok:
            visible.add(start)
    return visible


def product_own_conditions():
    """Условия по самому товару: прошёл модерацию и не заблокирован."""
    return (
        Product.status == ProductStatus.approved,
        Product.is_active.is_(True),
    )


async def visible_to_customer(query, db: AsyncSession):
    """Навешивает на запрос по Product полное правило видимости."""
    category_ids = await visible_category_ids(db)
    return query.where(
        *product_own_conditions(),
        shop_visible_expr(),
        # Пустой набор превратился бы в `IN ()`, что MySQL не принимает.
        Product.category_id.in_(category_ids or [-1]),
    )


async def unavailable_product_ids(products: Iterable[Product], db: AsyncSession) -> list[int]:
    """
    Из уже загруженных товаров возвращает те, что покупателю недоступны.

    Нужно там, где товары взяты не запросом с фильтром, а из связи: позиции
    корзины при оформлении заказа, товары коллекции.
    """
    products = list(products)
    if not products:
        return []

    category_ids = await visible_category_ids(db)
    shop_ids = {p.shop_base_id for p in products}
    rows = await db.execute(
        select(ShopBase.id).where(
            ShopBase.id.in_(shop_ids),
            *shop_public_conditions(),
        )
    )
    open_shops = set(rows.scalars().all())

    return [
        p.id
        for p in products
        if not p.is_active
        or p.status != ProductStatus.approved
        or p.shop_base_id not in open_shops
        or p.category_id not in category_ids
    ]


async def unavailable_reason(product_id: int, db: AsyncSession) -> str:
    """Почему товар недоступен покупателю — человеческим языком.

    Корзина и избранное отвечали на любую причину одинаково: «Product not found
    or inactive». Товар при этом мог быть совершенно исправен — достаточно было
    выключить его категорию, и продавец получал сообщение, обвиняющее товар, а
    настоящая причина лежала в другом разделе и на другом уровне дерева.

    Вызывать только после того, как правило видимости уже отказало: функция
    объясняет отказ, а не проверяет доступность.
    """
    product = (
        await db.execute(select(Product).where(Product.id == product_id))
    ).scalar_one_or_none()
    if product is None:
        return "Product not found"

    if product.status != ProductStatus.approved:
        return "Product has not passed moderation"
    if not product.is_active:
        return "Product is not on sale"

    shop_ok = (
        await db.execute(
            select(ShopBase.id).where(
                ShopBase.id == product.shop_base_id,
                *shop_public_conditions(),
            )
        )
    ).scalar_one_or_none()
    if shop_ok is None:
        return "The store of this product is closed"

    if product.category_id not in await visible_category_ids(db):
        return "Product category is disabled"

    # Правило отказало, а по частям всё в порядке: состояние успело измениться
    # между проверкой и объяснением.
    return "Product is not available"
