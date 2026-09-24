from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import case, exists, func, select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.warehouse_operation import WarehouseOperation, WarehouseOperationType
from app.models.warehouse import Warehouse
from app.models.shop_base import ShopBase
from app.models.product import Product
from app.models.measure_unit import MeasureUnit
from app.models.currency import Currency
from app.models.product_translation import ProductTranslation
from app.core.pagination import limit_param, paginate, skip_param
from app.schemas.warehouse_operation import (
    WarehouseOperationCreate,
    WarehouseOperationResponse,
    WarehouseProductBalance,
    WarehouseStockResponse,
)
from app.core.dependencies import require_permissions
from app.core.permissions import Perm

router = APIRouter()

POSITIVE_TYPES = {WarehouseOperationType.income, WarehouseOperationType.return_from_customer}
NEGATIVE_TYPES = {WarehouseOperationType.sold, WarehouseOperationType.return_to_shop, WarehouseOperationType.write_off}


def _compute_balance(operations: list[WarehouseOperation]) -> Decimal:
    balance = Decimal("0")
    for op in operations:
        if op.operation_type in POSITIVE_TYPES:
            balance += op.quantity
        else:
            balance -= op.quantity
    return balance


async def _get_warehouse_or_404(warehouse_id: int, db: AsyncSession) -> Warehouse:
    result = await db.execute(select(Warehouse).where(Warehouse.id == warehouse_id))
    warehouse = result.scalar_one_or_none()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return warehouse


async def _get_shop_or_404(shop_id: int, db: AsyncSession) -> ShopBase:
    result = await db.execute(select(ShopBase).where(ShopBase.id == shop_id))
    shop = result.scalar_one_or_none()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    return shop


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


@router.post("/", response_model=WarehouseOperationResponse, status_code=status.HTTP_201_CREATED)
async def create_warehouse_operation(
    payload: WarehouseOperationCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.WAREHOUSE_OPERATIONS_CREATE)),
):
    await _get_warehouse_or_404(payload.warehouse_id, db)
    await _get_shop_or_404(payload.shop_id, db)
    await _get_product_or_404(payload.product_id, db)
    await _get_measure_unit_or_404(payload.measure_unit_id, db)

    if payload.operation_type in NEGATIVE_TYPES:
        # Без блокировки строки два одновременных списания проходили одну и ту
        # же проверку, и остаток склада уходил в минус.
        await db.execute(
            select(Product.id).where(Product.id == payload.product_id).with_for_update()
        )
        # Чтение блокирующее: в REPEATABLE READ обычный SELECT вернул бы снимок,
        # снятый до ожидания на блокировке, то есть устаревший остаток.
        bal_result = await db.execute(
            select(WarehouseOperation)
            .where(
                WarehouseOperation.warehouse_id == payload.warehouse_id,
                WarehouseOperation.product_id == payload.product_id,
            )
            .with_for_update()
        )
        balance = _compute_balance(bal_result.scalars().all())
        if balance < payload.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock. Available: {balance}, requested: {payload.quantity}",
            )

    op = WarehouseOperation(
        warehouse_id=payload.warehouse_id,
        shop_id=payload.shop_id,
        product_id=payload.product_id,
        measure_unit_id=payload.measure_unit_id,
        operation_type=payload.operation_type,
        quantity=payload.quantity,
    )
    db.add(op)
    await db.commit()

    result = await db.execute(
        select(WarehouseOperation)
        .options(selectinload(WarehouseOperation.measure_unit))
        .where(WarehouseOperation.id == op.id)
    )
    return result.scalar_one()


@router.get("/warehouse/{warehouse_id}/balances", response_model=list[WarehouseProductBalance])
async def get_warehouse_balances(
    warehouse_id: int,
    response: Response = None,  # type: ignore[assignment]
    skip: int = skip_param(),
    limit: int = limit_param(50),
    name: Optional[str] = Query(default=None, description="Фильтр по части названия товара"),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.WAREHOUSE_OPERATIONS_READ)),
):
    """
    Остатки всех товаров на складе.

    Такого метода не было: на странице склада в админке таблица «Товары на
    складе» была строкой-заглушкой без запроса и всегда сообщала, что склад
    пуст — независимо от настоящих остатков. Поштучный опрос по каждому товару
    (единственное, что было) для списка не годится.

    Товары с нулевым и отрицательным остатком не показываются: они на складе
    отсутствуют, а история по ним доступна отдельным методом.
    """
    await _get_warehouse_or_404(warehouse_id, db)

    signed = func.sum(
        case(
            (WarehouseOperation.operation_type.in_(POSITIVE_TYPES), WarehouseOperation.quantity),
            else_=-WarehouseOperation.quantity,
        )
    )
    query = (
        select(
            WarehouseOperation.product_id,
            func.coalesce(signed, 0).label("balance"),
            func.min(WarehouseOperation.measure_unit_id).label("measure_unit_id"),
        )
        .where(WarehouseOperation.warehouse_id == warehouse_id)
        .group_by(WarehouseOperation.product_id)
        .having(func.coalesce(signed, 0) > 0)
    )

    if name:
        query = query.where(
            exists().where(
                (ProductTranslation.product_id == WarehouseOperation.product_id)
                & ProductTranslation.name.ilike(f"%{name}%")
            )
        )

    query = query.order_by(WarehouseOperation.product_id)
    rows = (await db.execute(await paginate(db, response, query, skip=skip, limit=limit))).all()
    if not rows:
        return []

    product_ids = [r.product_id for r in rows]
    unit_ids = [r.measure_unit_id for r in rows if r.measure_unit_id is not None]

    products = {
        p.id: p
        for p in (await db.execute(
            select(Product)
            .where(Product.id.in_(product_ids))
            .options(
                selectinload(Product.translations),
                selectinload(Product.brand),
                selectinload(Product.currency).selectinload(Currency.translations),
                selectinload(Product.measure_unit).selectinload(MeasureUnit.translations),
            )
        )).scalars().all()
    }
    units = {
        u.id: u
        for u in (await db.execute(
            select(MeasureUnit)
            .where(MeasureUnit.id.in_(unit_ids or [-1]))
            .options(selectinload(MeasureUnit.translations))
        )).scalars().all()
    }

    return [
        WarehouseProductBalance(
            product_id=r.product_id,
            product=products[r.product_id],
            balance=r.balance,
            measure_unit=units.get(r.measure_unit_id),
        )
        for r in rows
        if r.product_id in products
    ]


@router.get("/warehouse/{warehouse_id}/product/{product_id}", response_model=WarehouseStockResponse)
async def get_warehouse_product_stock(
    warehouse_id: int,
    product_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.WAREHOUSE_OPERATIONS_READ)),
):
    await _get_warehouse_or_404(warehouse_id, db)
    await _get_product_or_404(product_id, db)

    result = await db.execute(
        select(WarehouseOperation)
        .options(selectinload(WarehouseOperation.measure_unit))
        .where(
            WarehouseOperation.warehouse_id == warehouse_id,
            WarehouseOperation.product_id == product_id,
        )
        .order_by(WarehouseOperation.created_at)
    )
    operations = result.scalars().all()
    balance = _compute_balance(operations)

    return WarehouseStockResponse(
        warehouse_id=warehouse_id,
        product_id=product_id,
        balance=balance,
        operations=operations,
    )


@router.get("/warehouse/{warehouse_id}/product/{product_id}/balance", response_model=dict)
async def get_warehouse_product_balance(
    warehouse_id: int,
    product_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.WAREHOUSE_OPERATIONS_READ)),
):
    await _get_warehouse_or_404(warehouse_id, db)
    await _get_product_or_404(product_id, db)

    result = await db.execute(
        select(WarehouseOperation).where(
            WarehouseOperation.warehouse_id == warehouse_id,
            WarehouseOperation.product_id == product_id,
        )
    )
    operations = result.scalars().all()
    balance = _compute_balance(operations)

    return {"warehouse_id": warehouse_id, "product_id": product_id, "balance": balance}
