from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import get_current_user, require_permissions
from app.core.ownership import STAFF_STOCK, ensure_can_manage_shop
from app.core.pagination import limit_param, set_pagination_headers, skip_param
from app.core.permissions import Perm
from app.database import get_db
from app.models.notification import NotificationKind
from app.models.product import Product
from app.models.shop_additional import ShopAdditional, WarehouseType
from app.models.shop_base import ShopBase
from app.models.user import User
from app.models.warehouse_operation import WarehouseOperation, WarehouseOperationType
from app.models.withdrawal_request import WithdrawalItem, WithdrawalRequest, WithdrawalStatus
from app.schemas.withdrawal import (
    WithdrawalCreate,
    WithdrawalItemResponse,
    WithdrawalReject,
    WithdrawalResponse,
)
from app.services.notifications import notify_shop_owner
from app.services.stock import fbo_available, fbo_take_plan

router = APIRouter()


def _with_relations():
    return (
        selectinload(WithdrawalRequest.shop).selectinload(ShopBase.additional),
        selectinload(WithdrawalRequest.items)
        .selectinload(WithdrawalItem.product)
        .selectinload(Product.translations),
        selectinload(WithdrawalRequest.items).selectinload(WithdrawalItem.measure_unit),
    )


def _to_response(request: WithdrawalRequest, lang: str = "ru") -> WithdrawalResponse:
    items = []
    for item in request.items:
        translations = item.product.translations if item.product else []
        name = next((tr.name for tr in translations if tr.language == lang), None)
        if name is None and translations:
            name = translations[0].name
        items.append(WithdrawalItemResponse(
            id=item.id,
            product_id=item.product_id,
            product_name=name,
            measure_unit_code=item.measure_unit.code if item.measure_unit else None,
            quantity=item.quantity,
        ))
    shop = request.shop
    return WithdrawalResponse(
        id=request.id,
        shop_id=request.shop_id,
        shop_name=shop.additional.name if shop and shop.additional else None,
        status=request.status,
        comment=request.comment,
        resolution_comment=request.resolution_comment,
        created_at=request.created_at,
        resolved_at=request.resolved_at,
        items=items,
    )


async def _load(db: AsyncSession, request_id: int) -> WithdrawalRequest:
    request = (await db.execute(
        select(WithdrawalRequest)
        .options(*_with_relations())
        .where(WithdrawalRequest.id == request_id)
        .execution_options(populate_existing=True)
    )).scalar_one_or_none()
    if request is None:
        raise HTTPException(status_code=404, detail="Withdrawal request not found")
    return request


async def _lock_pending(db: AsyncSession, request_id: int) -> WithdrawalRequest:
    """Заявка, ещё ждущая решения. Строка блокируется: два одновременных
    решения иначе оба прошли бы проверку «ещё не рассмотрена»."""
    await db.execute(
        select(WithdrawalRequest.id).where(WithdrawalRequest.id == request_id).with_for_update()
    )
    request = await _load(db, request_id)
    if request.status != WithdrawalStatus.pending:
        raise HTTPException(status_code=400, detail="Withdrawal request is already resolved")
    return request


@router.post("/", response_model=WithdrawalResponse, status_code=status.HTTP_201_CREATED)
async def create_withdrawal(
    payload: WithdrawalCreate,
    lang: str = Query("ru"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Продавец FBO просит вернуть ему товар со складов Postshop.

    Количество проверяется по свободному остатку (за вычетом резерва открытых
    заказов) уже здесь, чтобы продавец сразу видел, что просит невозможное.
    Окончательная проверка — при выполнении: остаток мог измениться.
    """
    await ensure_can_manage_shop(payload.shop_id, current_user, db, staff_codes=STAFF_STOCK,
                                 detail="You can only manage stock of your own shops")
    warehouse_type = (await db.execute(
        select(ShopAdditional.warehouse_type).where(ShopAdditional.shop_base_id == payload.shop_id)
    )).scalar_one_or_none()
    if warehouse_type != WarehouseType.fbo:
        raise HTTPException(
            status_code=409,
            detail="Withdrawals are for FBO shops only: an FBS shop keeps its goods itself",
        )

    product_ids = [item.product_id for item in payload.items]
    if len(set(product_ids)) != len(product_ids):
        raise HTTPException(status_code=400, detail="Each product can appear only once")
    products = {
        p.id: p for p in (await db.execute(
            select(Product).where(Product.id.in_(product_ids))
        )).scalars().all()
    }
    request = WithdrawalRequest(
        shop_id=payload.shop_id,
        status=WithdrawalStatus.pending,
        comment=(payload.comment or "").strip() or None,
    )
    for item in payload.items:
        product = products.get(item.product_id)
        if product is None or product.shop_base_id != payload.shop_id:
            raise HTTPException(
                status_code=400,
                detail=f"Product {item.product_id} does not belong to shop {payload.shop_id}",
            )
        free = await fbo_available(db, payload.shop_id, item.product_id)
        if free < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough free stock of product {item.product_id}: "
                       f"free {max(free, 0)}, requested {item.quantity}",
            )
        request.items.append(WithdrawalItem(
            product_id=item.product_id,
            measure_unit_id=product.measure_unit_id,
            quantity=item.quantity,
        ))
    db.add(request)
    await db.commit()
    return _to_response(await _load(db, request.id), lang)


@router.get("/shop/{shop_id}", response_model=list[WithdrawalResponse])
async def list_shop_withdrawals(
    shop_id: int,
    response: Response,
    skip: int = skip_param(),
    limit: int = limit_param(),
    lang: str = Query("ru"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Заявки магазина на вывоз — в любом состоянии, новые сверху."""
    await ensure_can_manage_shop(shop_id, current_user, db, staff_codes=STAFF_STOCK,
                                 detail="You can only read stock of your own shops")
    total = (await db.execute(
        select(func.count(WithdrawalRequest.id)).where(WithdrawalRequest.shop_id == shop_id)
    )).scalar() or 0
    set_pagination_headers(response, total=total, skip=skip, limit=limit)
    rows = (await db.execute(
        select(WithdrawalRequest)
        .options(*_with_relations())
        .where(WithdrawalRequest.shop_id == shop_id)
        .order_by(WithdrawalRequest.id.desc())
        .offset(skip)
        .limit(limit)
    )).scalars().all()
    return [_to_response(r, lang) for r in rows]


@router.post("/{request_id}/cancel", response_model=WithdrawalResponse)
async def cancel_withdrawal(
    request_id: int,
    lang: str = Query("ru"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Продавец отзывает заявку, пока её не рассмотрели."""
    request = await _lock_pending(db, request_id)
    await ensure_can_manage_shop(request.shop_id, current_user, db, staff_codes=STAFF_STOCK,
                                 detail="You can only manage stock of your own shops")
    request.status = WithdrawalStatus.cancelled
    request.resolved_at = datetime.now(timezone.utc)
    await db.commit()
    return _to_response(await _load(db, request_id), lang)


# ── Разбор заявок платформой ─────────────────────────────────────────────────


@router.get("/", response_model=list[WithdrawalResponse])
async def list_withdrawals(
    response: Response,
    skip: int = skip_param(),
    limit: int = limit_param(),
    withdrawal_status: WithdrawalStatus | None = Query(None, alias="status"),
    lang: str = Query("ru"),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.WAREHOUSE_OPERATIONS_CREATE)),
):
    conditions = []
    if withdrawal_status is not None:
        conditions.append(WithdrawalRequest.status == withdrawal_status)
    total = (await db.execute(
        select(func.count(WithdrawalRequest.id)).where(*conditions)
    )).scalar() or 0
    set_pagination_headers(response, total=total, skip=skip, limit=limit)
    rows = (await db.execute(
        select(WithdrawalRequest)
        .options(*_with_relations())
        .where(*conditions)
        .order_by(WithdrawalRequest.id.desc())
        .offset(skip)
        .limit(limit)
    )).scalars().all()
    return [_to_response(r, lang) for r in rows]


@router.get("/count")
async def pending_withdrawals_count(
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.WAREHOUSE_OPERATIONS_CREATE)),
):
    """Сколько заявок ждёт склада — для счётчика в меню админки."""
    count = (await db.execute(
        select(func.count(WithdrawalRequest.id))
        .where(WithdrawalRequest.status == WithdrawalStatus.pending)
    )).scalar() or 0
    return {"count": count}


@router.post("/{request_id}/complete", response_model=WithdrawalResponse)
async def complete_withdrawal(
    request_id: int,
    lang: str = Query("ru"),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.WAREHOUSE_OPERATIONS_CREATE)),
):
    """
    Товар передан продавцу: со складов пишется «возврат магазину».

    Свободный остаток проверяется заново: с момента заявки товар могли
    купить. Не хватает хотя бы по одной позиции — заявка не выполняется
    целиком, и сотрудник отклоняет её с объяснением.
    """
    request = await _lock_pending(db, request_id)
    for item in request.items:
        plan = await fbo_take_plan(db, request.shop_id, item.product_id, item.quantity)
        for warehouse_id, quantity in plan:
            db.add(WarehouseOperation(
                warehouse_id=warehouse_id,
                shop_id=request.shop_id,
                product_id=item.product_id,
                measure_unit_id=item.measure_unit_id,
                operation_type=WarehouseOperationType.return_to_shop,
                quantity=quantity,
            ))
    request.status = WithdrawalStatus.completed
    request.resolved_at = datetime.now(timezone.utc)
    await notify_shop_owner(
        db,
        shop_base_id=request.shop_id,
        kind=NotificationKind.withdrawal_completed,
        entity_id=request.id,
    )
    await db.commit()
    return _to_response(await _load(db, request_id), lang)


@router.post("/{request_id}/reject", response_model=WithdrawalResponse)
async def reject_withdrawal(
    request_id: int,
    payload: WithdrawalReject,
    lang: str = Query("ru"),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.WAREHOUSE_OPERATIONS_CREATE)),
):
    """Отказать в вывозе — с причиной, она уходит продавцу."""
    request = await _lock_pending(db, request_id)
    request.status = WithdrawalStatus.rejected
    request.resolution_comment = payload.resolution_comment.strip()
    request.resolved_at = datetime.now(timezone.utc)
    await notify_shop_owner(
        db,
        shop_base_id=request.shop_id,
        kind=NotificationKind.withdrawal_rejected,
        entity_id=request.id,
        comment=request.resolution_comment,
    )
    await db.commit()
    return _to_response(await _load(db, request_id), lang)
