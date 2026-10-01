from decimal import Decimal
from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status, Response
from sqlalchemy import delete as sql_delete, select, asc, desc, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from typing import Literal, Optional

from app.database import get_db
from app.core.pagination import limit_param, paginate, skip_param
from app.core.visibility import unavailable_product_ids
from app.core.ownership import (STAFF_ORDERS, ensure_can_manage_shop,
                                get_user_shop_ids, is_staff)
from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.city import City
from app.models.country import Country
from app.models.currency import Currency
from app.models.measure_unit import MeasureUnit
from app.models.order import Order, OrderItem
from app.models.order_shop import OrderShop, LocalOrderStatusCode
from app.models.order_status import OrderStatus, OrderStatusCode
from app.models.pickup_point import PickupPoint
from app.models.product import Product, effective_price
from app.models.region import Region
from app.models.shop_additional import ShopAdditional, WarehouseType
from app.models.shop_base import ShopBase
from app.models.user import User
from app.schemas.order import (
    ShopInsightsResponse,
    ShopSummaryResponse,
    ReturnedProduct,
    UnsoldProduct,
    SummaryPeriod,
    SummaryPoint,
    SummaryTotals,
    OrderCreate, OrderResponse, OrderStatusUpdate, ShopOrderStatusUpdate,
    OrderCancelRequest, TopProductResponse, DailyRevenue,
    ShopWeeklyRevenueResponse,
)
from app.core.dependencies import require_permissions
from app.core.permissions import Perm
from app.models.notification import NotificationKind
from app.models.return_request import ReturnRequest, ReturnStatus
from app.models.review import Review, ReviewStatus
from app.services.notifications import notify, notify_shop_owner
from app.services.sms import send_sms
from app.services.stock import check_cart_stock, record_sold_for_order, send_out_of_stock_sms
from app.core.business_time import BUSINESS_TZ, local_date_expr, local_midnight_utc, local_now

router = APIRouter()

SortOption = Literal["status_asc", "status_desc", "newest", "oldest"]

# Глобальный статус заказа — переключает только администратор, вручную.
# Никакой автоматики на основе локальных статусов: система лишь отдаёт
# их в ответе (order_shops), а решение принимает админ.
VALID_TRANSITIONS: dict[OrderStatusCode, set[OrderStatusCode]] = {
    OrderStatusCode.pending:          {OrderStatusCode.approved, OrderStatusCode.rejected},
    OrderStatusCode.approved:         {OrderStatusCode.ready_to_take, OrderStatusCode.rejected},
    OrderStatusCode.ready_to_take:    {OrderStatusCode.ready_to_deliver},
    OrderStatusCode.ready_to_deliver: {OrderStatusCode.completed, OrderStatusCode.rejected},
    OrderStatusCode.rejected:         set(),
    OrderStatusCode.completed:        set(),
}

# Глобальные статусы, на которых покупатель ещё может отменить заказ сам:
# до того, как заказ собран (ready_to_take). Резерв стока при отмене
# освобождается автоматически (см. services/stock.py), списания до completed нет.
CUSTOMER_CANCELLABLE_STATUSES: set[OrderStatusCode] = {
    OrderStatusCode.pending,
    OrderStatusCode.approved,
}

# Префикс комментария, помечающий отмену покупателем (отдельного статуса cancelled
# нет — используем rejected, различаем по этой пометке).
CUSTOMER_CANCEL_MARKER = "Отменён покупателем"

# Локальный статус части заказа — переключает магазин. Частичное выполнение:
# отказ одного магазина не валит весь заказ, его позиции просто выпадают.
LOCAL_VALID_TRANSITIONS: dict[LocalOrderStatusCode, set[LocalOrderStatusCode]] = {
    LocalOrderStatusCode.pending:       {LocalOrderStatusCode.approved, LocalOrderStatusCode.rejected},
    LocalOrderStatusCode.approved:      {LocalOrderStatusCode.ready_to_take, LocalOrderStatusCode.rejected},
    LocalOrderStatusCode.ready_to_take: set(),
    LocalOrderStatusCode.rejected:      set(),
}


def _city_chain(loader):
    """Догрузка переводов города + region/country поверх loader, ведущего к City."""
    return loader.options(
        selectinload(City.translations),
        selectinload(City.region).options(
            selectinload(Region.translations),
            selectinload(Region.country).selectinload(Country.translations),
        ),
    )


def _product_chain(loader):
    """Полная догрузка продукта (переводы, ед. измерения, магазин) поверх loader, ведущего к Product."""
    return loader.options(
        selectinload(Product.translations),
        selectinload(Product.brand),
        selectinload(Product.currency).selectinload(Currency.translations),
        selectinload(Product.measure_unit).selectinload(MeasureUnit.translations),
        _city_chain(
            selectinload(Product.shop_base).selectinload(ShopBase.additional).selectinload(ShopAdditional.city)
        ),
    )


def _order_query():
    return select(Order).options(
        selectinload(Order.user),
        selectinload(Order.order_status).selectinload(OrderStatus.translations),
        _city_chain(selectinload(Order.pickup_point).selectinload(PickupPoint.city)),
        _product_chain(selectinload(Order.items).selectinload(OrderItem.product)),
        _city_chain(
            selectinload(Order.order_shops).selectinload(OrderShop.shop_base)
            .selectinload(ShopBase.additional).selectinload(ShopAdditional.city)
        ),
        _product_chain(
            selectinload(Order.order_shops).selectinload(OrderShop.items).selectinload(OrderItem.product)
        ),
    )


async def get_order_or_404(order_id: int, db: AsyncSession) -> Order:
    # populate_existing: если заказ уже в identity-map этой сессии (например, после
    # смены статуса и commit при expire_on_commit=False), перезагружаем его атрибуты
    # и связи свежими значениями, иначе вернётся устаревший order_status.
    result = await db.execute(
        _order_query().where(Order.id == order_id).execution_options(populate_existing=True)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


async def _ensure_shop_exists(shop_id: int, db: AsyncSession) -> None:
    exists = await db.execute(select(ShopBase.id).where(ShopBase.id == shop_id))
    if exists.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Shop not found")


def _completed_shop_sales(shop_id: int, *columns):
    """Select с заданными колонками по позициям магазина из завершённых заказов.

    Джойнит order_items -> products (магазин) -> orders -> order_statuses (completed)
    -> order_shops (status != rejected). Используется для аналитики продаж.
    """
    return (
        select(*columns)
        .select_from(OrderItem)
        .join(Product, OrderItem.product_id == Product.id)
        .join(Order, OrderItem.order_id == Order.id)
        .join(OrderStatus, Order.order_status_id == OrderStatus.id)
        .join(OrderShop, OrderItem.order_shop_id == OrderShop.id)
        .where(
            Product.shop_base_id == shop_id,
            OrderStatus.code == OrderStatusCode.completed,
            OrderShop.status != LocalOrderStatusCode.rejected,
        )
    )


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    payload: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.ORDERS_CREATE)),
):
    cart_res = await db.execute(
        select(Cart)
        .where(Cart.user_id == current_user.id)
        .options(
            selectinload(Cart.items).selectinload(CartItem.product)
        )
    )
    cart = cart_res.scalar_one_or_none()
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Раньше проверялись только поля товара, поэтому заказ на товар закрытого
    # магазина оформлялся успешно — блокировка ничего не останавливала.
    inactive = await unavailable_product_ids([item.product for item in cart.items], db)
    if inactive:
        raise HTTPException(
            status_code=400,
            detail=f"Products are no longer available: {inactive}",
        )

    if payload.pickup_point_id is not None:
        pp_res = await db.execute(
            select(PickupPoint).where(PickupPoint.id == payload.pickup_point_id)
        )
        pp = pp_res.scalar_one_or_none()
        if not pp:
            raise HTTPException(status_code=404, detail="Pickup point not found")
        if not pp.is_active:
            raise HTTPException(status_code=400, detail="Pickup point is blocked")

    # Заказ распадается на части по магазинам: на каждый магазин — свой OrderShop
    # с локальным статусом pending, к нему привязываются его позиции.
    items_by_shop: dict[int, list[CartItem]] = defaultdict(list)
    for cart_item in cart.items:
        items_by_shop[cart_item.product.shop_base_id].append(cart_item)

    # Снимок способа фулфилмента каждого магазина на момент оформления заказа.
    # Тип магазина могут поменять позже — и проверка остатка, и последующее
    # списание опираются на зафиксированное здесь значение, а не на текущее.
    wh_type_res = await db.execute(
        select(ShopAdditional.shop_base_id, ShopAdditional.warehouse_type)
        .where(ShopAdditional.shop_base_id.in_(items_by_shop.keys()))
    )
    warehouse_type_by_shop: dict[int, WarehouseType] = {
        shop_base_id: warehouse_type for shop_base_id, warehouse_type in wh_type_res.all()
    }

    # Проверка остатка для FBS-позиций (доступно = баланс журнала − резерв открытых
    # заказов). FBO и магазины без типа пропускаются. Блокирует строки товаров до
    # commit, чтобы конкурентные оформления не увели остаток в минус.
    await check_cart_stock(
        db,
        [
            (
                cart_item.product.shop_base_id,
                cart_item.product_id,
                warehouse_type_by_shop.get(cart_item.product.shop_base_id),
                cart_item.quantity,
            )
            for cart_item in cart.items
        ],
    )

    pending_res = await db.execute(
        select(OrderStatus).where(OrderStatus.code == "pending")
    )
    pending_status = pending_res.scalar_one_or_none()
    if not pending_status:
        raise HTTPException(status_code=500, detail="Order status 'pending' not found. Run migrations.")

    order = Order(
        user_id=current_user.id,
        order_status_id=pending_status.id,
        payment_type=payload.payment_type,
        delivery_address=payload.delivery_address,
        pickup_point_id=payload.pickup_point_id,
        comment=payload.comment,
    )
    db.add(order)
    await db.flush()

    for shop_base_id, shop_items in items_by_shop.items():
        order_shop = OrderShop(
            order_id=order.id,
            shop_base_id=shop_base_id,
            status=LocalOrderStatusCode.pending,
            warehouse_type=warehouse_type_by_shop.get(shop_base_id),
        )
        db.add(order_shop)
        await db.flush()
        for cart_item in shop_items:
            db.add(OrderItem(
                order_id=order.id,
                order_shop_id=order_shop.id,
                product_id=cart_item.product_id,
                quantity=cart_item.quantity,
                price_at_order=effective_price(cart_item.product),
            ))

    await db.execute(sql_delete(CartItem).where(CartItem.cart_id == cart.id))

    # Магазину о заказе сообщается при одобрении оператором, а не здесь: до
    # одобрения продавец сделать ничего не может, а когда наступало время
    # собирать, ему не приходило ничего (см. update_order_status).

    await db.commit()
    return await get_order_or_404(order.id, db)


@router.get("/pending/count")
async def get_pending_orders_count(
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.ORDERS_UPDATE_STATUS)),
):
    """Сколько заказов ждут оператора — для счётчика в меню админки.

    Оператор узнавал о новом заказе, только открыв список: у модерации,
    возвратов и приёмки счётчики были, у заказов — нет.
    """
    count = (await db.execute(
        select(func.count(Order.id))
        .join(OrderStatus, Order.order_status_id == OrderStatus.id)
        .where(OrderStatus.code == OrderStatusCode.pending)
    )).scalar_one()
    return {"count": count}


@router.get("/shop/{shop_id}/attention-count")
async def get_shop_attention_count(
    shop_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.ORDERS_READ)),
):
    """Сколько заказов ждут действий продавца — для счётчика «Мои заказы».

    Это части FBS в одобренном оператором заказе, которые ещё не приняты или
    не собраны. Части FBO собирает склад Postshop — продавцу они не задача.
    """
    await ensure_can_manage_shop(shop_id, current_user, db, staff_codes=STAFF_ORDERS,
                                 detail="You can only read orders of your own shops")
    count = (await db.execute(
        select(func.count(OrderShop.id))
        .join(Order, OrderShop.order_id == Order.id)
        .join(OrderStatus, Order.order_status_id == OrderStatus.id)
        .where(
            OrderShop.shop_base_id == shop_id,
            OrderStatus.code == OrderStatusCode.approved,
            OrderShop.status.in_((LocalOrderStatusCode.pending, LocalOrderStatusCode.approved)),
            (OrderShop.warehouse_type.is_(None)) | (OrderShop.warehouse_type != WarehouseType.fbo),
        )
    )).scalar_one()
    return {"count": count}


@router.get("/", response_model=list[OrderResponse])
async def get_orders(
    response: Response = None,  # type: ignore[assignment]
    skip:      int           = skip_param(),
    limit:     int           = limit_param(20),
    status_id: Optional[int] = Query(default=None, description="Фильтр по ID статуса"),
    user_id:   Optional[int] = Query(default=None, description="Фильтр по пользователю"),
    sort:      SortOption    = Query(default="newest"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.ORDERS_READ)),
):
    """Список заказов.

    Право orders:read в описании помечено как административное, но выдаётся
    каждому при регистрации, и фильтра по владельцу здесь не было — любой
    зарегистрировавшийся читал все заказы платформы с телефонами и адресами
    покупателей. Теперь без права сотрудника выдача сужается до своих заказов.
    """
    query = _order_query()

    if not is_staff(current_user, *STAFF_ORDERS):
        query = query.where(Order.user_id == current_user.id)

    if status_id is not None:
        query = query.where(Order.order_status_id == status_id)
    if user_id is not None:
        query = query.where(Order.user_id == user_id)

    if sort == "status_asc":
        query = query.order_by(asc(Order.order_status_id))
    elif sort == "status_desc":
        query = query.order_by(desc(Order.order_status_id))
    elif sort == "oldest":
        query = query.order_by(asc(Order.created_at))
    else:
        query = query.order_by(desc(Order.created_at))

    result = await db.execute(await paginate(db, response, query, skip=skip, limit=limit))
    return result.scalars().all()


@router.get("/my", response_model=list[OrderResponse])
async def get_my_orders(
    response: Response = None,  # type: ignore[assignment]
    skip:      int           = skip_param(),
    limit:     int           = limit_param(20),
    status_id: Optional[int] = Query(default=None),
    sort:      SortOption    = Query(default="newest"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.ORDERS_READ_OWN)),
):
    query = _order_query().where(Order.user_id == current_user.id)

    if status_id is not None:
        query = query.where(Order.order_status_id == status_id)

    if sort == "status_asc":
        query = query.order_by(asc(Order.order_status_id))
    elif sort == "status_desc":
        query = query.order_by(desc(Order.order_status_id))
    elif sort == "oldest":
        query = query.order_by(asc(Order.created_at))
    else:
        query = query.order_by(desc(Order.created_at))

    result = await db.execute(await paginate(db, response, query, skip=skip, limit=limit))
    return result.scalars().all()


@router.get("/shop/{shop_id}", response_model=list[OrderResponse])
async def get_shop_orders(
    shop_id:   int,
    response: Response = None,  # type: ignore[assignment]
    skip:      int           = skip_param(),
    limit:     int           = limit_param(20),
    status_id: Optional[int] = Query(default=None, description="Фильтр по ID статуса"),
    sort:      SortOption    = Query(default="newest"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.ORDERS_READ)),
):
    # Магазин чужой — 403. Раньше проверялось только существование, поэтому
    # выручку и заказы конкурента читал любой.
    await ensure_can_manage_shop(shop_id, current_user, db, staff_codes=STAFF_ORDERS,
                                 detail="You can only read orders of your own shops")

    shop_order_ids = (
        select(OrderItem.order_id)
        .join(Product, OrderItem.product_id == Product.id)
        .where(Product.shop_base_id == shop_id)
    )
    query = _order_query().where(Order.id.in_(shop_order_ids))

    if status_id is not None:
        query = query.where(Order.order_status_id == status_id)

    if sort == "status_asc":
        query = query.order_by(asc(Order.order_status_id))
    elif sort == "status_desc":
        query = query.order_by(desc(Order.order_status_id))
    elif sort == "oldest":
        query = query.order_by(asc(Order.created_at))
    else:
        query = query.order_by(desc(Order.created_at))

    result = await db.execute(await paginate(db, response, query, skip=skip, limit=limit))
    orders = result.scalars().all()

    # Кабинет продавца: в каждом заказе оставляем только позиции и магазин его магазина.
    # Валидируем в Pydantic перед фильтрацией, чтобы не трогать ORM-связь items
    # (cascade="all, delete-orphan" удалил бы отброшенные позиции при flush).
    responses: list[OrderResponse] = []
    for order in orders:
        resp = OrderResponse.model_validate(order)
        resp.items = [item for item in resp.items if item.product.shop_base_id == shop_id]
        resp.shops = [shop for shop in resp.shops if shop.id == shop_id]
        resp.order_shops = [os for os in resp.order_shops if os.shop_base_id == shop_id]
        responses.append(resp)
    return responses


@router.get("/shop/{shop_id}/top-products", response_model=list[TopProductResponse])
async def get_shop_top_products(
    shop_id: int,
    limit:   int = Query(default=10, ge=1, le=100, description="Сколько товаров вернуть"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.ORDERS_READ)),
):
    """Самые покупаемые товары магазина — по суммарному проданному количеству
    в завершённых (completed) заказах. Учитываются только неотклонённые части."""
    # Магазин чужой — 403. Раньше проверялось только существование, поэтому
    # выручку и заказы конкурента читал любой.
    await ensure_can_manage_shop(shop_id, current_user, db, staff_codes=STAFF_ORDERS,
                                 detail="You can only read orders of your own shops")

    base = (
        _completed_shop_sales(
            shop_id,
            OrderItem.product_id,
            func.sum(OrderItem.quantity).label("total_quantity"),
            func.sum(OrderItem.quantity * OrderItem.price_at_order).label("total_revenue"),
        )
        .group_by(OrderItem.product_id)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(limit)
    )

    rows = (await db.execute(base)).all()
    if not rows:
        return []

    # Догружаем сами товары для ответа, сохраняя порядок топа.
    product_ids = [r.product_id for r in rows]
    products_res = await db.execute(
        select(Product).where(Product.id.in_(product_ids)).options(
            selectinload(Product.translations),
            selectinload(Product.brand),
            selectinload(Product.currency).selectinload(Currency.translations),
            selectinload(Product.measure_unit).selectinload(MeasureUnit.translations),
        )
    )
    products = {p.id: p for p in products_res.scalars().all()}

    return [
        TopProductResponse(
            product=products[r.product_id],
            total_quantity=int(r.total_quantity),
            total_revenue=r.total_revenue,
        )
        for r in rows
        if r.product_id in products
    ]


def _summary_bounds(period: SummaryPeriod) -> tuple[datetime, datetime, timedelta, int]:
    """
    Границы текущего периода, его длина и шаг точки графика в днях.

    Неделя считается с понедельника, месяц и квартал — просто назад от сегодня.
    Календарный месяц сделал бы сравнение неравным (28 дней против 31), а
    продавцу нужно сравнить одинаковые отрезки, а не имена месяцев.
    """
    # Сутки — местные (Ашхабад), а сравнение с базой идёт в UTC.
    today = local_now().date()
    tomorrow = today + timedelta(days=1)
    end = local_midnight_utc(tomorrow)

    if period == SummaryPeriod.week:
        start = local_midnight_utc(today - timedelta(days=today.weekday()))
        step = 1
    elif period == SummaryPeriod.month:
        start = local_midnight_utc(tomorrow - timedelta(days=30))
        step = 1
    else:
        start = local_midnight_utc(tomorrow - timedelta(days=90))
        # У квартала 90 точек на графике нечитаемы — группируем по неделям.
        step = 7

    return start, end, end - start, step


async def _summary_totals(db: AsyncSession, shop_id: int, start: datetime, end: datetime):
    """Итоги магазина за отрезок: заказы, выручка, средний чек, отказы."""
    row = (await db.execute(
        _completed_shop_sales(
            shop_id,
            func.coalesce(func.sum(OrderItem.quantity * OrderItem.price_at_order), 0).label("revenue"),
            func.count(func.distinct(Order.id)).label("orders"),
        ).where(Order.created_at >= start, Order.created_at < end)
    )).one()

    orders = int(row.orders or 0)
    revenue = Decimal(row.revenue or 0)

    # Отказы считаем отдельно: _completed_shop_sales их отбрасывает намеренно —
    # отклонённая часть не продажа. Но продавцу важно видеть, сколько он
    # отклонил сам, и в каких заказах, а не только то, что дошло до денег.
    rejected = (await db.execute(
        select(func.count(func.distinct(OrderShop.order_id)))
        .select_from(OrderShop)
        .join(Order, Order.id == OrderShop.order_id)
        .where(
            OrderShop.shop_base_id == shop_id,
            OrderShop.status == LocalOrderStatusCode.rejected,
            Order.created_at >= start,
            Order.created_at < end,
        )
    )).scalar() or 0
    rejected = int(rejected)

    total_parts = orders + rejected
    return SummaryTotals(
        orders_count=orders,
        total_revenue=revenue,
        average_check=(revenue / orders).quantize(Decimal("0.01")) if orders else Decimal("0"),
        rejected_count=rejected,
        rejected_share=(
            (Decimal(rejected) * 100 / total_parts).quantize(Decimal("0.1"))
            if total_parts else Decimal("0")
        ),
    )


@router.get("/shop/{shop_id}/summary", response_model=ShopSummaryResponse)
async def get_shop_summary(
    shop_id: int,
    period: SummaryPeriod = SummaryPeriod.week,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.ORDERS_READ)),
):
    """
    Сводка магазина за период и такая же за предыдущий.

    Прежняя выдача считала только текущую неделю с понедельника: в понедельник
    утром продавец видел почти пустой график и решал, что всё сломалось. И
    главное — число без базы сравнения ничего не значит: «выручка 5000» не
    говорит, хорошо это или плохо, пока рядом нет прошлой недели.
    """
    await ensure_can_manage_shop(shop_id, current_user, db, staff_codes=STAFF_ORDERS,
                                 detail="You can only read orders of your own shops")

    start, end, length, step = _summary_bounds(period)
    prev_start, prev_end = start - length, start

    current = await _summary_totals(db, shop_id, start, end)
    previous = await _summary_totals(db, shop_id, prev_start, prev_end)

    day_expr = local_date_expr(Order.created_at)
    rows = (await db.execute(
        _completed_shop_sales(
            shop_id,
            day_expr.label("day"),
            func.coalesce(func.sum(OrderItem.quantity * OrderItem.price_at_order), 0).label("revenue"),
            func.count(func.distinct(Order.id)).label("orders"),
        )
        .where(Order.created_at >= start, Order.created_at < end)
        .group_by(day_expr)
    )).all()
    by_day = {r.day: r for r in rows}

    # Пустые отрезки отдаём нулями: без них график «сжимается» и дни без продаж
    # просто исчезают с оси, создавая впечатление ровных продаж.
    points: list[SummaryPoint] = []
    cursor = start
    while cursor < end:
        bucket_end = min(cursor + timedelta(days=step), end)
        orders = revenue = 0
        day = cursor
        while day < bucket_end:
            found = by_day.get(day.astimezone(BUSINESS_TZ).date())
            if found:
                orders += int(found.orders)
                revenue += Decimal(found.revenue)
            day += timedelta(days=1)
        points.append(SummaryPoint(
            date=cursor.astimezone(BUSINESS_TZ).date(),
            orders_count=orders,
            total_revenue=Decimal(revenue),
        ))
        cursor = bucket_end

    return ShopSummaryResponse(
        shop_id=shop_id,
        period=period,
        period_start=start,
        period_end=end,
        current=current,
        previous=previous,
        points=points,
    )


@router.get("/shop/{shop_id}/insights", response_model=ShopInsightsResponse)
async def get_shop_insights(
    shop_id: int,
    period: SummaryPeriod = SummaryPeriod.month,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.ORDERS_READ)),
):
    """
    Списки, по которым продавцу есть что сделать: что не продаётся, что
    возвращают, как оценивают.

    Отдельно от сводки: та отвечает на «как дела», эта — на «что чинить». В
    одном ответе они означали бы тяжёлые выборки при каждом переключении
    периода на графике.

    По умолчанию месяц, а не неделя: за неделю «не продавалось» покажет почти
    весь ассортимент и ничего не подскажет.
    """
    shop = await ensure_can_manage_shop(shop_id, current_user, db, staff_codes=STAFF_ORDERS,
                                        detail="You can only read orders of your own shops")

    start, end, _length, _step = _summary_bounds(period)

    # Что продавалось за период — чтобы вычесть из списка товаров магазина.
    sold_ids = set((await db.execute(
        _completed_shop_sales(shop_id, OrderItem.product_id)
        .where(Order.created_at >= start, Order.created_at < end)
        .distinct()
    )).scalars().all())

    products = (await db.execute(
        select(Product)
        .options(selectinload(Product.translations))
        .where(Product.shop_base_id == shop_id, Product.is_active.is_(True))
    )).scalars().all()

    # Сортируем по просмотрам: товар, который смотрят и не покупают, — самый
    # понятный повод что-то поменять. Товар, который не смотрят, — это вопрос к
    # каталогу, а не к цене.
    unsold = sorted(
        (p for p in products if p.id not in sold_ids),
        key=lambda p: (-(p.views_count or 0), p.id),
    )[:20]

    returned_rows = (await db.execute(
        select(
            OrderItem.product_id,
            func.count(ReturnRequest.id).label("returns_count"),
            func.coalesce(func.sum(ReturnRequest.quantity), 0).label("quantity"),
        )
        .select_from(ReturnRequest)
        .join(OrderItem, OrderItem.id == ReturnRequest.order_item_id)
        .join(Product, Product.id == OrderItem.product_id)
        .where(
            Product.shop_base_id == shop_id,
            ReturnRequest.status == ReturnStatus.approved,
            ReturnRequest.created_at >= start,
            ReturnRequest.created_at < end,
        )
        .group_by(OrderItem.product_id)
        .order_by(func.count(ReturnRequest.id).desc())
        .limit(20)
    )).all()
    by_id = {p.id: p for p in products}

    new_reviews = (await db.execute(
        select(func.count(Review.id))
        .select_from(Review)
        .join(Product, Product.id == Review.product_id)
        .where(
            Product.shop_base_id == shop_id,
            Review.status == ReviewStatus.approved,
            Review.created_at >= start,
            Review.created_at < end,
        )
    )).scalar() or 0

    return ShopInsightsResponse(
        shop_id=shop_id,
        period_start=start,
        period_end=end,
        rating_avg=shop.rating_avg,
        rating_count=shop.rating_count or 0,
        new_reviews=int(new_reviews),
        unsold=[
            UnsoldProduct(
                product_id=p.id,
                translations=p.translations,
                price=p.price,
                views_count=p.views_count or 0,
                rating_avg=p.rating_avg,
            )
            for p in unsold
        ],
        returned=[
            ReturnedProduct(
                product_id=r.product_id,
                translations=by_id[r.product_id].translations if r.product_id in by_id else [],
                returns_count=int(r.returns_count),
                quantity=Decimal(r.quantity),
            )
            for r in returned_rows
        ],
    )


@router.get("/shop/{shop_id}/weekly-revenue", response_model=ShopWeeklyRevenueResponse)
async def get_shop_weekly_revenue(
    shop_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.ORDERS_READ)),
):
    """Суммарный доход магазина за текущую неделю (с понедельника 00:00 этой
    недели) по завершённым заказам, без отклонённых частей. Период — по дате
    создания заказа (отдельной даты завершения в модели нет)."""
    # Магазин чужой — 403. Раньше проверялось только существование, поэтому
    # выручку и заказы конкурента читал любой.
    await ensure_can_manage_shop(shop_id, current_user, db, staff_codes=STAFF_ORDERS,
                                 detail="You can only read orders of your own shops")

    today = local_now().date()
    monday = today - timedelta(days=today.weekday())
    week_start = local_midnight_utc(monday)
    week_end = local_midnight_utc(monday + timedelta(days=7))

    row = (await db.execute(
        _completed_shop_sales(
            shop_id,
            func.coalesce(func.sum(OrderItem.quantity * OrderItem.price_at_order), 0).label("total_revenue"),
            func.count(func.distinct(Order.id)).label("orders_count"),
        ).where(Order.created_at >= week_start, Order.created_at < week_end)
    )).one()

    # Разбивка по дням: в ответе её не было, поэтому график выручки в кабинете
    # продавца лежал закомментированным, а на экране оставался заголовок без
    # содержимого.
    day_expr = local_date_expr(Order.created_at)
    day_rows = (await db.execute(
        _completed_shop_sales(
            shop_id,
            day_expr.label("day"),
            func.coalesce(func.sum(OrderItem.quantity * OrderItem.price_at_order), 0).label("total_revenue"),
            func.count(func.distinct(Order.id)).label("orders_count"),
        )
        .where(Order.created_at >= week_start, Order.created_at < week_end)
        .group_by(day_expr)
    )).all()
    by_day_map = {r.day: r for r in day_rows}

    # Отдаём все семь дней, включая нулевые: иначе график «сжимался» и дни без
    # продаж просто исчезали с оси.
    by_day = []
    for offset in range(7):
        day = monday + timedelta(days=offset)
        found = by_day_map.get(day)
        by_day.append(DailyRevenue(
            date=day,
            orders_count=int(found.orders_count) if found else 0,
            total_revenue=found.total_revenue if found else Decimal("0"),
        ))

    return ShopWeeklyRevenueResponse(
        shop_id=shop_id,
        period_start=week_start,
        period_end=week_end,
        orders_count=int(row.orders_count),
        total_revenue=row.total_revenue,
        by_day=by_day,
    )


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.ORDERS_READ)),
):
    """Заказ доступен покупателю, магазину из состава заказа и сотруднику."""
    order = await get_order_or_404(order_id, db)

    if is_staff(current_user, *STAFF_ORDERS) or order.user_id == current_user.id:
        return order

    my_shops = set(await get_user_shop_ids(current_user, db))
    if any(os.shop_base_id in my_shops for os in order.order_shops):
        return order

    raise HTTPException(status_code=403, detail="You can only read your own orders")


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    payload:  OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.ORDERS_UPDATE_STATUS)),
):
    order = await get_order_or_404(order_id, db)

    current_code = OrderStatusCode(order.order_status.code)
    allowed = VALID_TRANSITIONS[current_code]

    if not allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Order is in terminal status '{current_code}', no further transitions allowed",
        )
    if payload.status_code not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot transition from '{current_code}' to '{payload.status_code}'. "
                   f"Allowed: {[s.value for s in allowed]}",
        )

    # Цена доставки назначается ровно один раз — при переводе в approved.
    # На других переходах её передача — ошибка, а не молчаливое игнорирование.
    if payload.status_code != OrderStatusCode.approved and payload.delivery_price is not None:
        raise HTTPException(
            status_code=400,
            detail="delivery_price can only be set when approving the order",
        )
    if payload.status_code == OrderStatusCode.approved:
        if order.delivery_address is not None:
            if payload.delivery_price is None:
                raise HTTPException(
                    status_code=400,
                    detail="delivery_price is required to approve an order with delivery_address",
                )
            order.delivery_price = payload.delivery_price
        elif payload.delivery_price is not None:
            # Самовывоз: доставки нет, цена не применима (остаётся NULL).
            raise HTTPException(
                status_code=400,
                detail="Order uses a pickup point, delivery_price is not applicable",
            )

    # Мягкий гард на ready_to_take: заказ нельзя собирать к доставке, пока не все
    # неотклонённые магазины готовы; если отказали все — заказу место в rejected.
    if payload.status_code == OrderStatusCode.ready_to_take:
        active_shops = [s for s in order.order_shops if s.status != LocalOrderStatusCode.rejected]
        if not active_shops:
            raise HTTPException(
                status_code=400,
                detail="All shops rejected their parts — set the order to 'rejected', not 'ready_to_take'",
            )
        not_ready = [s.shop_base_id for s in active_shops if s.status != LocalOrderStatusCode.ready_to_take]
        if not_ready:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot mark 'ready_to_take': shops {not_ready} are not yet 'ready_to_take'",
            )

    target_res = await db.execute(
        select(OrderStatus).where(OrderStatus.code == payload.status_code)
    )
    target_status = target_res.scalar_one_or_none()
    if not target_status:
        raise HTTPException(status_code=404, detail="Target order status not found")

    order.order_status_id = target_status.id
    if payload.comment is not None:
        order.comment = payload.comment

    # Заказ завершён — списываем проданный товар со склада по не-rejected частям.
    # Идемпотентно и атомарно в этой же транзакции; completed — терминальный статус,
    # повторно сюда не попасть. FBO/без типа сервис пропускает.
    out_of_stock: list = []
    if payload.status_code == OrderStatusCode.completed:
        out_of_stock = await record_sold_for_order(db, order)

    # Покупатель узнавал о смене статуса, только зайдя и проверив: ни письма, ни
    # SMS, ни отметки в интерфейсе не было. Новый код статуса кладём в comment
    # уведомления — переводить его должен клиент, у витрины четыре языка.
    await notify(
        db,
        user_id=order.user_id,
        kind=NotificationKind.order_status,
        entity_id=order.id,
        comment=payload.status_code.value,
    )

    # Одобрение — момент, когда продавцу пора собирать заказ. Раньше ему
    # сообщали при оформлении, когда действовать было ещё нельзя, а при
    # одобрении не приходило ничего, и заказ лежал несобранным.
    shop_sms: list[tuple[str, str]] = []
    if payload.status_code == OrderStatusCode.approved:
        for order_shop in order.order_shops:
            if order_shop.status == LocalOrderStatusCode.rejected:
                continue
            await notify_shop_owner(
                db,
                shop_base_id=order_shop.shop_base_id,
                kind=NotificationKind.order_created,
                entity_id=order.id,
            )
            # Часть FBO собирает склад Postshop — продавцу SMS ни к чему.
            if order_shop.warehouse_type != WarehouseType.fbo:
                phone = (await db.execute(
                    select(User.phone)
                    .join(ShopBase, ShopBase.owner_id == User.id)
                    .where(ShopBase.id == order_shop.shop_base_id)
                )).scalar_one_or_none()
                if phone:
                    shop_sms.append((
                        phone,
                        f"Postshop: новый заказ №{order.id}. Примите его и соберите "
                        f"в кабинете продавца.",
                    ))

    await db.commit()
    # SMS — после коммита: иначе продавец получал бы сообщение и о том, чего
    # не случилось, если транзакция не зафиксировалась.
    await send_out_of_stock_sms(out_of_stock)
    for phone, text in shop_sms:
        await send_sms(phone, text)
    return await get_order_or_404(order_id, db)


@router.patch("/{order_id}/shop/{shop_id}/status", response_model=OrderResponse)
async def update_shop_order_status(
    order_id: int,
    shop_id:  int,
    payload:  ShopOrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.ORDERS_UPDATE_SHOP_STATUS)),
):
    """Магазин меняет локальный статус своей части заказа.

    Доступно только после того, как админ глобально одобрил заказ (approved):
    именно тогда заказ разослан по магазинам. Переходы:
    pending → approved/rejected, approved → ready_to_take/rejected.
    """
    # Принадлежность магазина вызывающему: без неё посторонний отклонял часть
    # любого заказа в любом магазине.
    await ensure_can_manage_shop(shop_id, current_user, db, staff_codes=STAFF_ORDERS,
                                 detail="You can only manage orders of your own shops")

    order = await get_order_or_404(order_id, db)

    if OrderStatusCode(order.order_status.code) != OrderStatusCode.approved:
        raise HTTPException(
            status_code=400,
            detail="Shop can change its status only while the order is globally 'approved'",
        )

    order_shop = next((os for os in order.order_shops if os.shop_base_id == shop_id), None)
    if order_shop is None:
        raise HTTPException(status_code=404, detail="This shop has no part in the order")

    # Часть FBO собирает склад Postshop: товар лежит там, а не у продавца.
    # Продавец раньше «принимал» такой заказ и отмечал «готов к выдаче», хотя
    # физически ничего не собирал. Статус этой части ведёт сотрудник.
    if order_shop.warehouse_type == WarehouseType.fbo and not is_staff(current_user, *STAFF_ORDERS):
        raise HTTPException(
            status_code=403,
            detail="FBO orders are fulfilled by the Postshop warehouse; "
                   "their status is changed by platform staff",
        )

    current_code = LocalOrderStatusCode(order_shop.status)
    allowed = LOCAL_VALID_TRANSITIONS[current_code]

    if not allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Shop part is in terminal status '{current_code.value}', no further transitions allowed",
        )
    if payload.status_code not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot transition shop status from '{current_code.value}' to '{payload.status_code.value}'. "
                   f"Allowed: {[s.value for s in allowed]}",
        )

    order_shop.status = payload.status_code
    if payload.comment is not None:
        order_shop.comment = payload.comment

    # Об отказе магазина покупателю не сообщалось ничего: уведомление
    # отправлял только общий метод смены статуса заказа, а общий статус при
    # отказе одного магазина не меняется. Заказ выглядел подтверждённым, и об
    # отказе человек узнавал, только зайдя и присмотревшись.
    #
    # Шлём в той же транзакции, что и сам отказ: notify() не делает commit
    # намеренно — уведомление должно появиться ровно тогда, когда событие
    # действительно записано, и исчезнуть вместе с ним, если запись не прошла.
    if payload.status_code == LocalOrderStatusCode.rejected:
        # Отказались все или только этот магазин — разные события: в первом
        # случае заказа больше нет, во втором остальные магазины везут своё.
        others_alive = any(
            os.id != order_shop.id and os.status != LocalOrderStatusCode.rejected
            for os in order.order_shops
        )

        # Когда живых частей не осталось, заказу место в rejected. Раньше общий
        # статус не менялся никогда: часть заказа и сам заказ — два независимых
        # поля, и согласовывать их было некому. Заказ, от которого отказались
        # все магазины, оставался «подтверждённым» — и для покупателя, и для
        # любого отчёта, который читает order_status напрямую.
        #
        # Метод смены общего статуса про это знает и не даёт собрать такой
        # заказ к выдаче («set the order to 'rejected', not 'ready_to_take'»),
        # но перевести его в rejected приходилось руками.
        if not others_alive:
            rejected_res = await db.execute(
                select(OrderStatus).where(OrderStatus.code == OrderStatusCode.rejected)
            )
            rejected_status = rejected_res.scalar_one_or_none()
            if not rejected_status:
                raise HTTPException(
                    status_code=500,
                    detail="Order status 'rejected' not found. Run migrations.",
                )
            order.order_status_id = rejected_status.id

        await notify(
            db,
            user_id=order.user_id,
            kind=(
                NotificationKind.order_shop_rejected
                if others_alive
                else NotificationKind.order_status
            ),
            entity_id=order.id,
            # Для order_status витрина переводит comment как код статуса,
            # поэтому здесь именно код, а не текст. У order_shop_rejected
            # comment — причина отказа от магазина, её показываем как есть.
            comment=(payload.comment if others_alive else OrderStatusCode.rejected.value),
        )

    await db.commit()
    return await get_order_or_404(order_id, db)


@router.post("/{order_id}/cancel", response_model=OrderResponse)
async def cancel_order(
    order_id: int,
    payload:  OrderCancelRequest = OrderCancelRequest(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.ORDERS_CREATE)),
):
    """Покупатель отменяет собственный заказ.

    Доступно только владельцу заказа и только пока заказ ещё не собран
    (глобальный статус pending или approved). Переводит заказ в rejected;
    резерв стока освобождается автоматически, списания до completed не было.
    """
    order = await get_order_or_404(order_id, db)

    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only cancel your own orders")

    current_code = OrderStatusCode(order.order_status.code)
    if current_code not in CUSTOMER_CANCELLABLE_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Order in status '{current_code.value}' can no longer be cancelled. "
                   f"Cancellable while: {[s.value for s in CUSTOMER_CANCELLABLE_STATUSES]}",
        )

    rejected_res = await db.execute(
        select(OrderStatus).where(OrderStatus.code == OrderStatusCode.rejected)
    )
    rejected_status = rejected_res.scalar_one_or_none()
    if not rejected_status:
        raise HTTPException(status_code=500, detail="Order status 'rejected' not found. Run migrations.")

    order.order_status_id = rejected_status.id
    order.comment = (
        f"{CUSTOMER_CANCEL_MARKER}: {payload.reason}" if payload.reason else CUSTOMER_CANCEL_MARKER
    )

    # Части заказа тоже закрываем: иначе у отменённого заказа остаются «живые»
    # части, и в кабинете продавца они выглядят ждущими решения. Действия по
    # ним всё равно запрещены (менять статус части можно только у заказа в
    # approved), но список показывал бы работу, которой нет.
    for order_shop in order.order_shops:
        if order_shop.status != LocalOrderStatusCode.rejected:
            order_shop.status = LocalOrderStatusCode.rejected

    # Магазин мог уже начать собирать заказ. Причину передаём: без неё отмена
    # выглядит случайной, а по ней видно, что чинить.
    for order_shop in order.order_shops:
        await notify_shop_owner(
            db,
            shop_base_id=order_shop.shop_base_id,
            kind=NotificationKind.order_cancelled,
            entity_id=order.id,
            comment=payload.reason,
        )

    await db.commit()
    return await get_order_or_404(order_id, db)
