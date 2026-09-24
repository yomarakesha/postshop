"""Проверки принадлежности объекта вызывающему.

Приём был написан один раз — в роутере товаров — и там работает правильно.
В остальных местах его просто забыли, и это дало целое семейство одинаковых
дыр: право у пользователя есть, а чей объект он правит, никто не смотрел.
Поэтому проверка вынесена сюда и применяется единообразно.

Разделение простое: «сотрудник платформы» — тот, у кого есть право, которое
обычному пользователю при регистрации не выдаётся (см. new_user_perms в
app/routers/auth.py). Сотрудник работает с любыми объектами, владелец — только
со своими.
"""

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import Perm
from app.models.shop_base import ShopBase
from app.models.user import User


def has_permission(user: User, code: str) -> bool:
    return any(p.code == code for p in user.permissions)


def is_staff(user: User, *codes: str) -> bool:
    """Есть ли у пользователя хотя бы одно из «сотруднических» прав."""
    return any(has_permission(user, code) for code in codes)


# Признаки сотрудника по областям. Все они отсутствуют в наборе, который
# выдаётся при регистрации, поэтому годятся как маркер роли.
STAFF_SHOPS = (Perm.PRODUCTS_MODERATE, Perm.USERS_READ)
STAFF_ORDERS = (Perm.ORDERS_UPDATE_STATUS, Perm.USERS_READ)
STAFF_STOCK = (Perm.STOCK_RECEIPTS_CONFIRM, Perm.USERS_READ)
STAFF_USERS = (Perm.USERS_READ,)


async def get_user_shop_ids(user: User, db: AsyncSession) -> list[int]:
    """Идентификаторы магазинов, которыми владеет пользователь."""
    result = await db.execute(select(ShopBase.id).where(ShopBase.owner_id == user.id))
    return [row[0] for row in result.all()]


async def ensure_can_manage_shop(
    shop_base_id: int,
    user: User,
    db: AsyncSession,
    *,
    staff_codes: tuple[str, ...] = STAFF_SHOPS,
    detail: str = "You can only manage your own shops",
) -> ShopBase:
    """Магазин существует и доступен вызывающему.

    404 — магазина нет, 403 — магазин чужой и вызывающий не сотрудник.
    """
    shop = (
        await db.execute(select(ShopBase).where(ShopBase.id == shop_base_id))
    ).scalar_one_or_none()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop base not found")

    if shop.owner_id != user.id and not is_staff(user, *staff_codes):
        raise HTTPException(status_code=403, detail=detail)
    return shop
