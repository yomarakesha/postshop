from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.stock_operation import StockOperation, OperationType
from app.models.product import Product
from app.models.measure_unit import MeasureUnit
from app.models.shop_base import ShopBase
from app.schemas.stock_operation import (
    StockOperationCreate,
    StockSetRequest,
    StockOperationResponse,
    ProductAvailability,
    ProductStockResponse,
    FbsStockSummary,
)
from app.core.dependencies import require_permissions
from app.core.ownership import STAFF_STOCK, ensure_can_manage_shop
from app.models.user import User
from app.core.permissions import Perm
from app.services.stock import (
    ensure_product_unit,
    available as stock_available,
    fbs_available,
    fbs_stock,
    is_tracked,
    note_if_out_of_stock,
    send_out_of_stock_sms,
)

from app.models.shop_additional import ShopAdditional, WarehouseType
router = APIRouter()


POSITIVE_TYPES = {
    OperationType.income,
    OperationType.return_from_customer,
    # Пересчёт хранит знак в количестве, поэтому складывается как есть.
    OperationType.correction,
}
NEGATIVE_TYPES = {OperationType.sold, OperationType.return_to_supplier}
MANUAL_TYPES = {OperationType.income, OperationType.return_to_supplier}

def _compute_balance(operations: list[StockOperation]) -> Decimal:
    balance = Decimal("0")
    for op in operations:
        if op.operation_type in POSITIVE_TYPES:
            balance += op.quantity
        else:
            balance -= op.quantity
    return balance


async def _get_product_or_404(product_id: int, db: AsyncSession) -> Product:
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


async def _get_measure_unit_or_404(measure_unit_id: int, db: AsyncSession) -> MeasureUnit:
    result = await db.execute(select(MeasureUnit).where(MeasureUnit.id == measure_unit_id))
    unit = result.scalar_one_or_none()
    if not unit:
        raise HTTPException(status_code=404, detail="Measure unit not found")
    return unit


async def _get_shop_or_404(shop_id: int, db: AsyncSession) -> ShopBase:
    result = await db.execute(select(ShopBase).where(ShopBase.id == shop_id))
    shop = result.scalar_one_or_none()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    return shop


@router.get("/availability", response_model=list[ProductAvailability])
async def get_products_availability(
    product_ids: list[int] = Query(..., description="Идентификаторы товаров"),
    db: AsyncSession = Depends(get_db),
):
    """
    Доступный остаток по нескольким товарам сразу.

    Поштучный опрос (единственное, что было) для карточки и списка не годится, а
    в самом ответе товара остатка нет вовсе. Метод публичный: сколько товара на
    полке — это то же самое, что покупатель видит в магазине.

    Считается доступный остаток, а не сырой баланс журнала: то, что уже держат
    открытые заказы, купить нельзя. Остаток берётся из журнала своего типа:
    FBS — из журнала магазина, FBO — со складов платформы. tracked=false —
    остаток покупку не ограничивает (FBO при выключенном складе платформы).
    """
    if not product_ids:
        return []

    rows = (await db.execute(
        select(Product.id, Product.shop_base_id, ShopAdditional.warehouse_type)
        .outerjoin(ShopAdditional, ShopAdditional.shop_base_id == Product.shop_base_id)
        .where(Product.id.in_(product_ids[:200]))
    )).all()

    result = []
    for product_id, shop_id, warehouse_type in rows:
        if not is_tracked(warehouse_type):
            result.append(ProductAvailability(product_id=product_id, tracked=False, available=Decimal("0")))
            continue
        left = await stock_available(db, shop_id, product_id, warehouse_type)
        result.append(ProductAvailability(
            product_id=product_id,
            tracked=True,
            available=left if left > 0 else Decimal("0"),
        ))
    return result


async def _ensure_fbs_shop(shop_id: int, db: AsyncSession) -> None:
    """Движения по складу магазина заводит только магазин FBS.

    У магазина FBO товар лежит на складе платформы, и приходует его платформа
    через приёмку. Приход «руками» в журнал магазина ни на что бы не влиял:
    заказы FBO проверяются по складу платформы — продавец видел бы остаток,
    которого нет.
    """
    warehouse_type = (await db.execute(
        select(ShopAdditional.warehouse_type).where(ShopAdditional.shop_base_id == shop_id)
    )).scalar_one_or_none()
    if warehouse_type != WarehouseType.fbs:
        raise HTTPException(
            status_code=409,
            detail="Stock operations are for FBS shops only. "
                   "FBO shop stock is posted by the platform through stock receipts.",
        )


@router.post("/", response_model=StockOperationResponse, status_code=status.HTTP_201_CREATED)
async def create_stock_operation(
    payload: StockOperationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.STOCK_OPERATIONS_CREATE)),
):
    """Движение товара по складу магазина.

    Раньше магазин, товар и единица проверялись по отдельности, а связь между
    ними и владельцем — нет. Посторонний мог оприходовать товар на чужой склад
    или списанием обнулить остаток конкурента, и его товары перестали бы
    заказываться.
    """
    if payload.operation_type == OperationType.correction:
        raise HTTPException(
            status_code=400,
            detail="Corrections are written by POST /stock-operations/set, "
                   "which computes the difference itself.",
        )
    # Продажу и возврат от покупателя пишет сервер — по заказу и по возврату.
    # Руками их можно было записать без заказа: журнал показывал продажи,
    # которых не было, а статистика и остатки расходились с заказами.
    if payload.operation_type not in MANUAL_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only 'income' and 'return_to_supplier' are recorded by hand; "
                   "sales and customer returns are written by orders and returns.",
        )

    await ensure_can_manage_shop(payload.shop_id, current_user, db,
                                 staff_codes=STAFF_STOCK,
                                 detail="You can only manage stock of your own shops")
    await _ensure_fbs_shop(payload.shop_id, db)
    product = await _get_product_or_404(payload.product_id, db)
    await _get_measure_unit_or_404(payload.measure_unit_id, db)

    if product.shop_base_id != payload.shop_id:
        raise HTTPException(
            status_code=400,
            detail=f"Product {product.id} belongs to shop {product.shop_base_id}, "
                   f"not to shop {payload.shop_id}",
        )
    ensure_product_unit(product, payload.measure_unit_id)

    if payload.operation_type in NEGATIVE_TYPES:
        # Строка товара блокируется до расчёта: без этого два одновременных
        # списания проходили одну и ту же проверку и остаток уходил в минус.
        await db.execute(
            select(Product.id).where(Product.id == payload.product_id).with_for_update()
        )
        # Сравнение шло с сырым остатком журнала, поэтому продавец списывал то,
        # что уже зарезервировано открытыми заказами, и заказ становился
        # невыполнимым. Считаем по доступному остатку — как при оформлении.
        available = await fbs_available(
            db, payload.shop_id, payload.product_id, for_update=True
        )
        if available < payload.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock. Available: {available}, "
                       f"requested: {payload.quantity}",
            )

    op = StockOperation(
        shop_id=payload.shop_id,
        product_id=payload.product_id,
        measure_unit_id=payload.measure_unit_id,
        operation_type=payload.operation_type,
        quantity=payload.quantity,
    )
    db.add(op)
    # Списание может обнулить остаток: продавец должен узнать об этом сразу,
    # а не от покупателя, который уже не смог купить.
    await db.flush()
    notice = await note_if_out_of_stock(
        db, payload.shop_id, payload.product_id, WarehouseType.fbs
    )
    await db.commit()
    await send_out_of_stock_sms([notice] if notice else [])
    await db.refresh(op)

    result = await db.execute(
        select(StockOperation)
        .options(selectinload(StockOperation.measure_unit))
        .where(StockOperation.id == op.id)
    )
    return result.scalar_one()


@router.get("/{product_id}", response_model=ProductStockResponse)
async def get_product_stock(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.STOCK_OPERATIONS_READ)),
):
    """Журнал движений товара — коммерческая тайна магазина, только своя."""
    product = await _get_product_or_404(product_id, db)
    await ensure_can_manage_shop(product.shop_base_id, current_user, db,
                                 staff_codes=STAFF_STOCK,
                                 detail="You can only read stock of your own shops")

    # Фильтр по магазину обязателен: без него в остаток попадали строки других
    # магазинов, и этот эндпоинт расходился с внутренним расчётом.
    result = await db.execute(
        select(StockOperation)
        .options(selectinload(StockOperation.measure_unit))
        .where(
            StockOperation.product_id == product_id,
            StockOperation.shop_id == product.shop_base_id,
        )
        .order_by(StockOperation.created_at)
    )
    operations = result.scalars().all()
    balance = _compute_balance(operations)

    return ProductStockResponse(
        product_id=product_id,
        balance=balance,
        operations=operations,
    )


@router.get("/{product_id}/summary", response_model=FbsStockSummary)
async def get_product_stock_summary(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.STOCK_OPERATIONS_READ)),
):
    """Остаток FBS в разрезе — для пересчёта полки.

    on_shelf — что должно лежать на полке (журнал минус собранное, но ещё не
    проданное), reserved — что держат открытые заказы, available — что можно
    продать.
    """
    product = await _get_product_or_404(product_id, db)
    await ensure_can_manage_shop(product.shop_base_id, current_user, db,
                                 staff_codes=STAFF_STOCK,
                                 detail="You can only read stock of your own shops")
    stock = await fbs_stock(db, product.shop_base_id, product_id)
    return FbsStockSummary(
        product_id=product_id,
        balance=stock.balance,
        on_shelf=stock.on_shelf,
        reserved=stock.reserved,
        available=max(stock.available, Decimal("0")),
    )


@router.get("/{product_id}/balance", response_model=dict)
async def get_product_balance(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.STOCK_OPERATIONS_READ)),
):
    product = await _get_product_or_404(product_id, db)
    await ensure_can_manage_shop(product.shop_base_id, current_user, db,
                                 staff_codes=STAFF_STOCK,
                                 detail="You can only read stock of your own shops")

    result = await db.execute(
        select(StockOperation).where(
            StockOperation.product_id == product_id,
            StockOperation.shop_id == product.shop_base_id,
        )
    )
    operations = result.scalars().all()
    balance = _compute_balance(operations)

    return {"product_id": product_id, "balance": balance}


@router.post("/set", response_model=StockOperationResponse, status_code=status.HTTP_201_CREATED)
async def set_stock(
    payload: StockSetRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.STOCK_OPERATIONS_CREATE)),
):
    """Пересчёт: продавец называет фактический остаток, разницу пишет сервер.

    Без этого пересчитанную полку нельзя было записать честно: чтобы свести
    остаток, продавец оформлял «приход» там, где товар нашёлся, и «возврат
    поставщику» там, где он пропал, — журнал переставал описывать то, что
    происходило на самом деле.

    Разница считается здесь, а не на экране: между чтением остатка и записью
    проходит время, за которое товар успевают купить, и присланное с экрана
    «стало 7» затёрло бы эту продажу. Строка товара блокируется, доступный
    остаток читается заново, и в журнал ложится именно разница.

    Совпало — операции нет: пустая запись «изменение 0» засоряет историю.
    """
    await ensure_can_manage_shop(payload.shop_id, current_user, db,
                                 staff_codes=STAFF_STOCK,
                                 detail="You can only manage stock of your own shops")
    await _ensure_fbs_shop(payload.shop_id, db)
    product = await _get_product_or_404(payload.product_id, db)
    await _get_measure_unit_or_404(payload.measure_unit_id, db)

    if product.shop_base_id != payload.shop_id:
        raise HTTPException(
            status_code=400,
            detail=f"Product {product.id} belongs to shop {product.shop_base_id}, "
                   f"not to shop {payload.shop_id}",
        )
    ensure_product_unit(product, payload.measure_unit_id)

    await db.execute(
        select(Product.id).where(Product.id == payload.product_id).with_for_update()
    )
    # Продавец считает то, что лежит на полке. Сравнивать с «доступно» нельзя:
    # оно за вычетом резерва, а несобранный заказ ещё на полке — пересчёт
    # прибавлял его второй раз. Собранный же заказ с полки уже ушёл, хотя
    # продажа ещё не записана, — его вычитаем из журнала.
    stock = await fbs_stock(db, payload.shop_id, payload.product_id, for_update=True)
    delta = payload.quantity - stock.on_shelf
    if delta == 0:
        raise HTTPException(status_code=409, detail="Stock already equals the requested amount")

    op = StockOperation(
        shop_id=payload.shop_id,
        product_id=payload.product_id,
        measure_unit_id=payload.measure_unit_id,
        operation_type=OperationType.correction,
        quantity=delta,
    )
    db.add(op)
    # Пересчёт может обнулить остаток — уведомление такое же, как после списания.
    await db.flush()
    notice = await note_if_out_of_stock(
        db, payload.shop_id, payload.product_id, WarehouseType.fbs
    )
    await db.commit()
    await send_out_of_stock_sms([notice] if notice else [])

    result = await db.execute(
        select(StockOperation)
        .options(selectinload(StockOperation.measure_unit))
        .where(StockOperation.id == op.id)
    )
    return result.scalar_one()
