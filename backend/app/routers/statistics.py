from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models.shop_base import ShopBase, RegistrationStatus
from app.models.user import User
from app.models.order import Order
from app.models.order_status import OrderStatus, OrderStatusCode
from app.schemas.statistics import (
    ShopsStatisticsResponse, ShopStatusCount,
    ClientsStatisticsResponse,
    OrdersStatisticsResponse, OrderStatusCount,
)
from app.core.dependencies import require_permissions
from app.core.permissions import Perm

router = APIRouter()


@router.get("/shops", response_model=ShopsStatisticsResponse)
async def get_shops_statistics(
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.STATISTICS_READ)),
):
    """Количество магазинов с разбивкой по статусам регистрации (RegistrationStatus)."""
    result = await db.execute(
        select(ShopBase.registration_status, func.count(ShopBase.id))
        .group_by(ShopBase.registration_status)
    )
    counts = {status: count for status, count in result.all()}

    by_status = [
        ShopStatusCount(status=status, count=counts.get(status, 0))
        for status in RegistrationStatus
    ]
    return ShopsStatisticsResponse(
        total=sum(counts.values()),
        by_status=by_status,
    )


@router.get("/clients", response_model=ClientsStatisticsResponse)
async def get_clients_statistics(
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.STATISTICS_READ)),
):
    """Количество клиентов — пользователей с флагом client=True."""
    total = await db.scalar(
        select(func.count(User.id)).where(User.client.is_(True))
    )
    return ClientsStatisticsResponse(total=total or 0)


@router.get("/orders", response_model=OrdersStatisticsResponse)
async def get_orders_statistics(
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.STATISTICS_READ)),
):
    """Количество заказов с разбивкой по статусам (OrderStatusCode)."""
    result = await db.execute(
        select(OrderStatus.code, func.count(Order.id))
        .join(OrderStatus, Order.order_status_id == OrderStatus.id)
        .group_by(OrderStatus.code)
    )
    counts = {code: count for code, count in result.all()}

    by_status = [
        OrderStatusCount(status=code, count=counts.get(code, 0))
        for code in OrderStatusCode
    ]
    return OrdersStatisticsResponse(
        total=sum(counts.values()),
        by_status=by_status,
    )
