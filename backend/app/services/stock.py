"""Складской учёт остатков, привязанный к жизненному циклу заказа.

Единая точка входа для проверки доступности и списания проданного товара.
Диспатчеризация идёт по способу фулфилмента (`warehouse_type`):

* ``fbs`` — магазин хранит товар сам и сам ведёт остаток
  (`stock_operations`). Работает всегда, флагом не выключается;
* ``fbo`` — товар лежит на складах платформы (`warehouse_operations`),
  приход — только через подтверждённую приёмку. Работает, пока включён склад
  платформы (`FBO_ENABLED`); выключен — FBO-позиции не проверяются и не
  списываются: платформа товар больше не хранит, и учитывать нечего.

Модель остатка одна для обоих типов:
    доступно = баланс_журнала − резерв
где баланс_журнала — сумма операций своего журнала со знаком, а резерв —
количество товара в открытых (не rejected и не завершённых/отклонённых
глобально) заказах магазина. Списание ``sold`` пишется один раз, в момент
глобального статуса ``completed``.
"""
from collections.abc import Sequence
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.order import Order, OrderItem
from app.models.order_shop import LocalOrderStatusCode, OrderShop
from app.models.order_status import OrderStatus, OrderStatusCode
from app.models.product import Product
from app.models.shop_additional import WarehouseType
from app.models.notification import Notification, NotificationKind
from app.models.product_translation import ProductTranslation
from app.models.shop_base import ShopBase
from app.models.stock_operation import OperationType, StockOperation
from app.models.user import User
from app.services.notifications import notify
from app.services.sms import send_sms
from app.models.warehouse_operation import WarehouseOperation, WarehouseOperationType

# Операции, увеличивающие / уменьшающие остаток в журнале магазина.
# Пересчёт идёт со знаком в самом количестве, поэтому складывается как есть —
# отсюда он в «положительных»: минус в quantity и вычтет.
_POSITIVE_TYPES = {
    OperationType.income,
    OperationType.return_from_customer,
    OperationType.correction,
}
_FBO_POSITIVE_TYPES = {WarehouseOperationType.income, WarehouseOperationType.return_from_customer}

# Глобальные статусы, при которых заказ больше не держит резерв:
# completed уже списан в журнал (иначе — двойной учёт), rejected не списывается.
_CLOSED_ORDER_STATUSES = (OrderStatusCode.completed, OrderStatusCode.rejected)


# ── FBS backend ──────────────────────────────────────────────────────────────

async def _fbs_ledger_balance(
    db: AsyncSession, shop_id: int, product_id: int, *, for_update: bool = False
) -> Decimal:
    """Исторический остаток товара в журнале магазина (сумма операций со знаком).

    ``for_update`` обязателен там, где по остатку принимается решение о записи.
    MySQL работает в REPEATABLE READ: обычный SELECT читает снимок, снятый в
    начале транзакции, поэтому после ожидания на блокировке строки товара
    запрос всё равно возвращал устаревший остаток — и два одновременных
    списания оба видели полный склад. Блокирующее чтение видит последнее
    зафиксированное состояние.
    """
    signed = func.sum(
        case(
            (StockOperation.operation_type.in_(_POSITIVE_TYPES), StockOperation.quantity),
            else_=-StockOperation.quantity,
        )
    )
    query = select(func.coalesce(signed, 0)).where(
        StockOperation.shop_id == shop_id,
        StockOperation.product_id == product_id,
    )
    if for_update:
        query = query.with_for_update()
    result = await db.execute(query)
    return Decimal(result.scalar_one())


async def _reserved(
    db: AsyncSession, shop_id: int, product_id: int, *, for_update: bool = False
) -> Decimal:
    """Количество товара, зарезервированное открытыми заказами магазина.

    Резерв одинаков для FBS и FBO: товар держит заказ, а не склад.

    Учитываются позиции не-rejected частей заказа, чей глобальный статус ещё не
    completed/rejected. completed уже отражён в балансе журнала, поэтому исключён.
    """
    query = (
        select(func.coalesce(func.sum(OrderItem.quantity), 0))
        .select_from(OrderItem)
        .join(OrderShop, OrderItem.order_shop_id == OrderShop.id)
        .join(Order, OrderItem.order_id == Order.id)
        .join(OrderStatus, Order.order_status_id == OrderStatus.id)
        .where(
            OrderShop.shop_base_id == shop_id,
            OrderItem.product_id == product_id,
            OrderShop.status != LocalOrderStatusCode.rejected,
            OrderStatus.code.notin_(_CLOSED_ORDER_STATUSES),
        )
    )
    if for_update:
        query = query.with_for_update()
    result = await db.execute(query)
    return Decimal(result.scalar_one())


async def fbs_available(
    db: AsyncSession, shop_id: int, product_id: int, *, for_update: bool = False
) -> Decimal:
    """Доступно к продаже: баланс журнала за вычетом резерва открытых заказов.

    ``for_update=True`` — когда по результату сразу пишется операция.
    """
    balance = await _fbs_ledger_balance(db, shop_id, product_id, for_update=for_update)
    reserved = await _reserved(db, shop_id, product_id, for_update=for_update)
    return balance - reserved


async def _fbs_record_sold(db: AsyncSession, order_shop: OrderShop) -> None:
    """Списывает sold по позициям части заказа. Идемпотентно (не списывает дважды)."""
    existing = await db.execute(
        select(StockOperation.id)
        .where(StockOperation.order_shop_id == order_shop.id)
        .limit(1)
    )
    if existing.scalar_one_or_none() is not None:
        return

    for item in order_shop.items:
        db.add(StockOperation(
            shop_id=order_shop.shop_base_id,
            product_id=item.product_id,
            measure_unit_id=item.product.measure_unit_id,
            operation_type=OperationType.sold,
            quantity=item.quantity,
            order_shop_id=order_shop.id,
        ))


# ── FBO backend ──────────────────────────────────────────────────────────────

def _fbo_signed_quantity():
    return case(
        (WarehouseOperation.operation_type.in_(_FBO_POSITIVE_TYPES), WarehouseOperation.quantity),
        else_=-WarehouseOperation.quantity,
    )


async def _fbo_ledger_balance(
    db: AsyncSession, shop_id: int, product_id: int, *, for_update: bool = False
) -> Decimal:
    """Остаток товара магазина на всех складах платформы вместе.

    Покупателю всё равно, на каком складе лежит товар, поэтому доступность
    считается по сумме складов. ``for_update`` — по той же причине, что у FBS.
    """
    query = select(func.coalesce(func.sum(_fbo_signed_quantity()), 0)).where(
        WarehouseOperation.shop_id == shop_id,
        WarehouseOperation.product_id == product_id,
    )
    if for_update:
        query = query.with_for_update()
    result = await db.execute(query)
    return Decimal(result.scalar_one())


async def fbo_available(
    db: AsyncSession, shop_id: int, product_id: int, *, for_update: bool = False
) -> Decimal:
    """Доступно к продаже со складов платформы: баланс за вычетом резерва."""
    balance = await _fbo_ledger_balance(db, shop_id, product_id, for_update=for_update)
    reserved = await _reserved(db, shop_id, product_id, for_update=for_update)
    return balance - reserved


async def _fbo_record_sold(db: AsyncSession, order_shop: OrderShop) -> None:
    """Списывает проданное со складов платформы. Идемпотентно.

    Товар одного магазина может лежать на нескольких складах: количество
    снимается по складам по порядку, пока не наберётся. Если остатка не
    хватило (приёмку отменить нельзя, а ручное списание могло опередить
    заказ), недостача пишется на склад, где товара было больше всего, —
    проданное должно быть отражено, иначе остаток завышен.
    """
    existing = await db.execute(
        select(WarehouseOperation.id)
        .where(WarehouseOperation.order_shop_id == order_shop.id)
        .limit(1)
    )
    if existing.scalar_one_or_none() is not None:
        return

    for item in order_shop.items:
        rows = (await db.execute(
            select(WarehouseOperation.warehouse_id, func.sum(_fbo_signed_quantity()))
            .where(
                WarehouseOperation.shop_id == order_shop.shop_base_id,
                WarehouseOperation.product_id == item.product_id,
            )
            .group_by(WarehouseOperation.warehouse_id)
            .order_by(WarehouseOperation.warehouse_id)
            .with_for_update()
        )).all()
        if not rows:
            # Товар ни разу не принимался на склад — списывать не с чего.
            continue

        remaining = Decimal(item.quantity)
        for warehouse_id, balance in rows:
            if remaining <= 0:
                break
            take = min(remaining, max(Decimal(balance), Decimal("0")))
            if take <= 0:
                continue
            db.add(_fbo_sold_operation(order_shop, item, warehouse_id, take))
            remaining -= take
        if remaining > 0:
            fullest = max(rows, key=lambda row: Decimal(row[1]))[0]
            db.add(_fbo_sold_operation(order_shop, item, fullest, remaining))


def _fbo_sold_operation(
    order_shop: OrderShop, item: OrderItem, warehouse_id: int, quantity: Decimal
) -> WarehouseOperation:
    return WarehouseOperation(
        warehouse_id=warehouse_id,
        shop_id=order_shop.shop_base_id,
        product_id=item.product_id,
        measure_unit_id=item.product.measure_unit_id,
        operation_type=WarehouseOperationType.sold,
        quantity=quantity,
        order_shop_id=order_shop.id,
    )


# ── Единица измерения ────────────────────────────────────────────────────────

def ensure_product_unit(product: Product, measure_unit_id: int) -> None:
    """Движение по складу — только в единице самого товара.

    Баланс складывает количества как есть: приход «2 коробки» и продажа
    «5 штук» (продажа всегда пишется в единице товара) давали остаток −3.
    Пересчёта между единицами нет, поэтому другая единица — ошибка.
    """
    if product.measure_unit_id is not None and measure_unit_id != product.measure_unit_id:
        raise HTTPException(
            status_code=400,
            detail=f"Product {product.id} is counted in measure unit "
                   f"{product.measure_unit_id}, not {measure_unit_id}",
        )


async def product_has_stock_history(db: AsyncSession, product_id: int) -> bool:
    """Есть ли у товара движения в каком-либо журнале или позиции в заказах.

    После этого единицу товара менять нельзя: старые количества записаны в
    прежней, и баланс начал бы складывать одно с другим.
    """
    for column in (StockOperation.product_id, WarehouseOperation.product_id, OrderItem.product_id):
        found = (await db.execute(
            select(column).where(column == product_id).limit(1)
        )).scalar_one_or_none()
        if found is not None:
            return True
    return False


# ── Публичный API (диспатч по warehouse_type) ────────────────────────────────

def is_tracked(warehouse_type: WarehouseType | None) -> bool:
    """Ограничивает ли остаток покупку у магазина этого типа.

    FBS — всегда. FBO — пока включён склад платформы: выключенный склад
    товар не хранит, и остаток по нему ничего не значит.
    """
    if warehouse_type == WarehouseType.fbs:
        return True
    return warehouse_type == WarehouseType.fbo and settings.FBO_ENABLED


async def available(
    db: AsyncSession,
    shop_id: int,
    product_id: int,
    warehouse_type: WarehouseType | None,
    *,
    for_update: bool = False,
) -> Decimal:
    """Доступный остаток по журналу, который соответствует типу магазина."""
    if warehouse_type == WarehouseType.fbo:
        return await fbo_available(db, shop_id, product_id, for_update=for_update)
    return await fbs_available(db, shop_id, product_id, for_update=for_update)


async def check_cart_stock(
    db: AsyncSession,
    items: list[tuple[int, int, WarehouseType | None, int]],
) -> None:
    """Проверяет доступность перед оформлением заказа.

    ``items`` — список кортежей ``(shop_id, product_id, warehouse_type, requested_qty)``.
    FBS-позиции проверяются всегда, FBO — пока включён склад платформы.
    Строки товаров блокируются ``FOR UPDATE`` в порядке product_id, чтобы
    сериализовать конкурентные оформления и не поймать дедлок.
    Бросает ``HTTPException 400`` при нехватке.
    """
    tracked_items = [
        (shop_id, product_id, warehouse_type, qty)
        for shop_id, product_id, warehouse_type, qty in items
        if is_tracked(warehouse_type)
    ]
    if not tracked_items:
        return

    product_ids = sorted({product_id for _, product_id, _, _ in tracked_items})
    await db.execute(
        select(Product.id).where(Product.id.in_(product_ids)).with_for_update()
    )

    shortfalls: list[str] = []
    for shop_id, product_id, warehouse_type, qty in tracked_items:
        left = await available(db, shop_id, product_id, warehouse_type, for_update=True)
        if left < qty:
            shortfalls.append(
                f"product {product_id}: available {left}, requested {qty}"
            )

    if shortfalls:
        raise HTTPException(
            status_code=400,
            detail="Insufficient stock. " + "; ".join(shortfalls),
        )


async def record_sold_for_order(db: AsyncSession, order: Order) -> list["OutOfStockNotice"]:
    """Списывает проданный товар по всем не-rejected частям заказа.

    Вызывается при переходе заказа в completed. Диспатчит по снимку
    ``warehouse_type`` каждой части: тип магазина мог смениться после
    оформления, а списывать надо оттуда, откуда товар отгружали.
    Не коммитит — коммит делает вызывающая транзакция. Возвращает товары,
    которые этой продажей закончились: по ним вызывающий шлёт SMS после
    коммита.
    """
    notices: list[OutOfStockNotice] = []
    for order_shop in order.order_shops:
        if order_shop.status == LocalOrderStatusCode.rejected:
            continue
        if not is_tracked(order_shop.warehouse_type):
            continue
        if order_shop.warehouse_type == WarehouseType.fbs:
            await _fbs_record_sold(db, order_shop)
        else:
            await _fbo_record_sold(db, order_shop)

        # Остаток считается по записанным операциям, поэтому сначала flush.
        await db.flush()
        for item in order_shop.items:
            notice = await note_if_out_of_stock(
                db, order_shop.shop_base_id, item.product_id, order_shop.warehouse_type
            )
            if notice is not None:
                notices.append(notice)

    return notices


async def record_return_from_customer(
    db: AsyncSession, order_item: OrderItem, quantity: Decimal
) -> None:
    """
    Возвращает товар на склад по подтверждённому возврату.

    Подтверждение возврата — это утверждение платформы, что товар у неё, поэтому
    возврат в журнал пишется тем же действием. Отдельного «товар приехал» в
    системе нет, и вводить состояние, которое некому проставить, значило бы
    завести заявки, застревающие навсегда.

    Пишется по снимку типа склада на момент заказа — по тому же правилу, по
    которому списывалось проданное. FBO-товар возвращается на тот склад, с
    которого был списан. Не коммитит: возврат должен появиться в журнале ровно
    тогда, когда заявка стала подтверждённой.
    """
    order_shop = order_item.order_shop
    if order_shop is None or not is_tracked(order_shop.warehouse_type):
        return

    if order_shop.warehouse_type == WarehouseType.fbs:
        db.add(StockOperation(
            shop_id=order_shop.shop_base_id,
            product_id=order_item.product_id,
            measure_unit_id=order_item.product.measure_unit_id,
            operation_type=OperationType.return_from_customer,
            quantity=quantity,
        ))
        return

    warehouse_id = (await db.execute(
        select(WarehouseOperation.warehouse_id)
        .where(
            WarehouseOperation.order_shop_id == order_shop.id,
            WarehouseOperation.product_id == order_item.product_id,
            WarehouseOperation.operation_type == WarehouseOperationType.sold,
        )
        .order_by(WarehouseOperation.id)
        .limit(1)
    )).scalar_one_or_none()
    if warehouse_id is None:
        # Заказ не списывался со склада (не был завершён или товар туда не
        # принимали) — возвращать некуда.
        return

    db.add(WarehouseOperation(
        warehouse_id=warehouse_id,
        shop_id=order_shop.shop_base_id,
        product_id=order_item.product_id,
        measure_unit_id=order_item.product.measure_unit_id,
        operation_type=WarehouseOperationType.return_from_customer,
        quantity=quantity,
        order_shop_id=order_shop.id,
    ))


# ── «Товар закончился» ───────────────────────────────────────────────────────

@dataclass(frozen=True)
class OutOfStockNotice:
    """Товар, остаток которого дошёл до нуля. Для SMS после коммита."""

    shop_id: int
    product_id: int
    product_name: str
    phone: str | None
    warehouse_type: WarehouseType | None = None


async def _product_name(db: AsyncSession, product_id: int) -> str:
    """Название товара на русском — язык SMS у нас один."""
    row = (await db.execute(
        select(ProductTranslation.name)
        .where(
            ProductTranslation.product_id == product_id,
            ProductTranslation.language == "ru",
        )
        .limit(1)
    )).scalar_one_or_none()
    return row or f"#{product_id}"


async def note_if_out_of_stock(
    db: AsyncSession,
    shop_id: int,
    product_id: int,
    warehouse_type: WarehouseType | None,
) -> OutOfStockNotice | None:
    """Заводит уведомление продавцу, если товар только что закончился.

    Продавец узнавал об этом от покупателя, который уже не смог купить: товар
    оставался в каталоге с надписью «нет в наличии». Уведомление приходит
    один раз — повторное за последние сутки не заводится, иначе каждая
    продажа при нулевом остатке слала бы его заново.

    Возвращает данные для SMS: её отправляет вызывающий, ПОСЛЕ коммита.
    Отправлять из транзакции нельзя — сообщение ушло бы и о том, чего не
    случилось.
    """
    if not is_tracked(warehouse_type):
        return None
    if await available(db, shop_id, product_id, warehouse_type) > 0:
        return None

    since = datetime.now(timezone.utc) - timedelta(days=1)
    already = (await db.execute(
        select(Notification.id).where(
            Notification.kind == NotificationKind.product_out_of_stock,
            Notification.entity_id == product_id,
            Notification.created_at >= since,
        ).limit(1)
    )).scalar_one_or_none()
    if already is not None:
        return None

    owner = (await db.execute(
        select(User.id, User.phone)
        .join(ShopBase, ShopBase.owner_id == User.id)
        .where(ShopBase.id == shop_id)
    )).first()
    if owner is None:
        return None

    name = await _product_name(db, product_id)
    await notify(
        db,
        user_id=owner.id,
        kind=NotificationKind.product_out_of_stock,
        entity_id=product_id,
        comment=name,
    )
    # Flush нужен здесь же: в одной транзакции может закончиться несколько
    # позиций одного товара, и проверка «уже уведомляли» иначе их не видит.
    await db.flush()
    return OutOfStockNotice(
        shop_id=shop_id,
        product_id=product_id,
        product_name=name,
        phone=owner.phone,
        warehouse_type=warehouse_type,
    )


async def send_out_of_stock_sms(notices: Sequence[OutOfStockNotice]) -> None:
    """Шлёт SMS по заведённым уведомлениям. Вызывать ПОСЛЕ коммита."""
    for notice in notices:
        if not notice.phone:
            continue
        # Пополняют по-разному: FBS принимает товар у себя, FBO отправляет его
        # на склад Postshop. Совет «пополните остаток» магазину FBO вёл в
        # раздел, которого у него нет.
        advice = (
            "Отправьте товар на склад Postshop или снимите его с продажи."
            if notice.warehouse_type == WarehouseType.fbo
            else "Примите товар в «Приёме товара» или снимите его с продажи."
        )
        await send_sms(
            notice.phone,
            f"Postshop: товар «{notice.product_name}» закончился. {advice}",
        )


# ── Незавершённые дела магазина ──────────────────────────────────────────────

async def shop_close_blockers(db: AsyncSession, shop_id: int) -> list[str]:
    """Что у магазина ещё не завершено; пусто — магазин можно закрыть.

    Открытые заказы (живая часть в незакрытом заказе) и возвраты, которые ещё
    ждут решения или одобрены, но товар не получен назад.
    """
    from app.models.return_request import ReturnRequest, ReturnStatus

    reasons: list[str] = []

    open_orders = (await db.execute(
        select(func.count(func.distinct(OrderShop.order_id)))
        .select_from(OrderShop)
        .join(Order, OrderShop.order_id == Order.id)
        .join(OrderStatus, Order.order_status_id == OrderStatus.id)
        .where(
            OrderShop.shop_base_id == shop_id,
            OrderShop.status != LocalOrderStatusCode.rejected,
            OrderStatus.code.notin_(_CLOSED_ORDER_STATUSES),
        )
    )).scalar_one()
    if open_orders:
        reasons.append(f"open orders: {open_orders}")

    open_returns = (await db.execute(
        select(func.count(ReturnRequest.id))
        .join(OrderItem, OrderItem.id == ReturnRequest.order_item_id)
        .join(OrderShop, OrderShop.id == OrderItem.order_shop_id)
        .where(
            OrderShop.shop_base_id == shop_id,
            (ReturnRequest.status == ReturnStatus.pending)
            | ((ReturnRequest.status == ReturnStatus.approved) & ReturnRequest.received_at.is_(None)),
        )
    )).scalar_one()
    if open_returns:
        reasons.append(f"unfinished returns: {open_returns}")

    return reasons


# ── Смена типа склада ────────────────────────────────────────────────────────

async def warehouse_type_change_blockers(db: AsyncSession, shop_id: int) -> list[str]:
    """Почему магазину сейчас нельзя сменить FBS ↔ FBO; пусто — можно.

    Остаток, резерв и приёмка живут каждый в своём учёте: остаток FBS — в
    журнале магазина, FBO — на складах платформы. После смены типа старый
    учёт просто перестаёт читаться — товар «исчезает» с одной стороны и не
    появляется с другой, открытый заказ списывается не оттуда, а черновик
    приёмки уже не подтвердить. Поэтому тип меняется только на чистом месте:
    остатки сведены к нулю, открытых заказов, незакрытых возвратов и
    черновиков приёмки нет.
    """
    from app.models.stock_receipt import ReceiptStatus, StockReceipt

    # Незакрытый возврат тоже держит старый учёт: он вернётся в журнал по
    # снимку типа на момент заказа — туда, где после смены его уже не читают.
    reasons = await shop_close_blockers(db, shop_id)

    drafts = (await db.execute(
        select(func.count(StockReceipt.id)).where(
            StockReceipt.shop_id == shop_id, StockReceipt.status == ReceiptStatus.draft
        )
    )).scalar_one()
    if drafts:
        reasons.append(f"draft stock receipts: {drafts}")

    signed_fbs = case(
        (StockOperation.operation_type.in_(_POSITIVE_TYPES), StockOperation.quantity),
        else_=-StockOperation.quantity,
    )
    fbs_left = (await db.execute(
        select(StockOperation.product_id)
        .where(StockOperation.shop_id == shop_id)
        .group_by(StockOperation.product_id)
        .having(func.sum(signed_fbs) != 0)
    )).all()
    if fbs_left:
        reasons.append(f"products with own (FBS) stock: {len(fbs_left)}")

    fbo_left = (await db.execute(
        select(WarehouseOperation.product_id)
        .where(WarehouseOperation.shop_id == shop_id)
        .group_by(WarehouseOperation.product_id)
        .having(func.sum(_fbo_signed_quantity()) != 0)
    )).all()
    if fbo_left:
        reasons.append(f"products at the platform warehouse (FBO): {len(fbo_left)}")

    return reasons
