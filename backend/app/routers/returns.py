from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import get_current_user, require_permissions
from app.core.ownership import STAFF_ORDERS, ensure_can_manage_shop, has_permission
from app.core.pagination import limit_param, set_pagination_headers, skip_param
from app.core.permissions import Perm
from app.database import get_db
from app.models.notification import NotificationKind
from app.models.order import Order, OrderItem
from app.models.order_status import OrderStatus, OrderStatusCode
from app.models.product import Product
from app.models.return_request import ReturnRequest, ReturnStatus
from app.models.shop_additional import WarehouseType
from app.models.user import User
from app.schemas.return_request import (
    ReturnCreateRequest,
    ReturnReceiveRequest,
    ReturnRejectRequest,
    ReturnResolveRequest,
    ReturnResponse,
)
from app.services.notifications import notify, notify_shop_owner
from app.services.stock import record_return_from_customer

router = APIRouter()

# Пока заявка в этих состояниях, второй такой же по той же покупке не бывает:
# либо её ещё рассматривают, либо возврат уже принят.
ACTIVE_STATUSES = (ReturnStatus.pending, ReturnStatus.approved)


def _to_response(request: ReturnRequest) -> ReturnResponse:
    """
    Заявка вместе с тем, что возвращают.

    Номер строки заказа сам по себе ничего не говорит ни покупателю, ни
    сотруднику: нужен товар и номер заказа. Достаём их из связей, а не храним
    копией — товар у строки заказа не меняется.
    """
    order_item = request.order_item
    product = order_item.product if order_item else None
    name = None
    if product is not None and product.translations:
        name = product.translations[0].name

    buyer = request.user
    buyer_name = None
    if buyer is not None:
        buyer_name = ' '.join(x for x in (buyer.name, buyer.surname) if x) or buyer.username

    return ReturnResponse(
        id=request.id,
        user_id=request.user_id,
        buyer_name=buyer_name,
        buyer_phone=buyer.phone if buyer is not None else None,
        order_item_id=request.order_item_id,
        order_id=order_item.order_id if order_item else None,
        product_id=order_item.product_id if order_item else None,
        product_name=name,
        quantity=request.quantity,
        reason=request.reason,
        status=request.status,
        resolution_comment=request.resolution_comment,
        warehouse_type=(
            order_item.order_shop.warehouse_type
            if order_item is not None and order_item.order_shop is not None
            else None
        ),
        received_at=request.received_at,
        restocked=request.restocked,
        created_at=request.created_at,
    )


def _with_relations():
    """Связи, нужные для ответа: без них Pydantic полез бы за ними лениво."""
    return (
        selectinload(ReturnRequest.order_item)
        .selectinload(OrderItem.product)
        .selectinload(Product.translations),
        selectinload(ReturnRequest.order_item).selectinload(OrderItem.order_shop),
        selectinload(ReturnRequest.user),
    )


async def _load(db: AsyncSession, request_id: int) -> ReturnRequest | None:
    result = await db.execute(
        select(ReturnRequest).options(*_with_relations()).where(ReturnRequest.id == request_id)
    )
    return result.scalar_one_or_none()


@router.get("/my", response_model=list[ReturnResponse])
async def list_own_returns(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Свои заявки в любом состоянии.

    Отклонённые тоже: без них заявка после отказа просто исчезает, и непонятно,
    рассмотрели её или потеряли.
    """
    result = await db.execute(
        select(ReturnRequest)
        .options(*_with_relations())
        .where(ReturnRequest.user_id == current_user.id)
        .order_by(ReturnRequest.id.desc())
    )
    return [_to_response(row) for row in result.scalars().all()]


@router.post("/", response_model=ReturnResponse, status_code=status.HTTP_201_CREATED)
async def create_return(
    payload: ReturnCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.RETURNS_CREATE)),
):
    """
    Заявка на возврат купленного товара.

    Требуется завершённый заказ этого пользователя: до завершения товар не
    получен, и возвращать нечего. То же правило стоит на отзывах.
    """
    result = await db.execute(
        select(OrderItem)
        .options(selectinload(OrderItem.product))
        .join(Order, Order.id == OrderItem.order_id)
        .join(OrderStatus, OrderStatus.id == Order.order_status_id)
        .where(
            OrderItem.id == payload.order_item_id,
            Order.user_id == current_user.id,
            OrderStatus.code == OrderStatusCode.completed,
        )
    )
    order_item = result.scalar_one_or_none()
    if order_item is None:
        # 404, а не 403: сообщать «такая покупка есть, но не ваша» значит
        # подтверждать существование чужого заказа.
        raise HTTPException(
            status_code=404,
            detail="Purchase not found among your completed orders",
        )

    if payload.quantity > Decimal(order_item.quantity):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot return more than purchased ({order_item.quantity})",
        )

    existing = await db.execute(
        select(ReturnRequest.id).where(
            ReturnRequest.order_item_id == payload.order_item_id,
            ReturnRequest.status.in_(ACTIVE_STATUSES),
        )
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=400, detail="A return for this purchase is already in progress"
        )

    request = ReturnRequest(
        user_id=current_user.id,
        order_item_id=payload.order_item_id,
        quantity=payload.quantity,
        reason=payload.reason,
        status=ReturnStatus.pending,
    )
    db.add(request)
    await db.commit()

    loaded = await _load(db, request.id)
    return _to_response(loaded)


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_return(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Отозвать свою заявку, пока её не рассмотрели.

    После решения — нельзя: подтверждённый возврат уже изменил склад, а
    отклонённый должен остаться видимым вместе с причиной.
    """
    request = await db.get(ReturnRequest, request_id)
    if request is None or request.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Return request not found")
    if request.status != ReturnStatus.pending:
        raise HTTPException(
            status_code=400, detail="Only a pending return request can be cancelled"
        )

    await db.delete(request)
    await db.commit()
    return None


# ── Разбор заявок платформой ─────────────────────────────────────────────────


@router.get("/", response_model=list[ReturnResponse])
async def list_returns(
    response: Response,
    skip: int = skip_param(),
    limit: int = limit_param(),
    return_status: ReturnStatus | None = None,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.RETURNS_MANAGE)),
):
    """Все заявки. Без фильтра — целиком, чтобы видеть и разобранные."""
    conditions = []
    if return_status is not None:
        conditions.append(ReturnRequest.status == return_status)

    total = await db.execute(select(func.count(ReturnRequest.id)).where(*conditions))
    set_pagination_headers(response, total=total.scalar() or 0, skip=skip, limit=limit)

    result = await db.execute(
        select(ReturnRequest)
        .options(*_with_relations())
        .where(*conditions)
        .order_by(ReturnRequest.id.desc())
        .offset(skip)
        .limit(limit)
    )
    return [_to_response(row) for row in result.scalars().all()]


@router.get("/shop/{shop_id}", response_model=list[ReturnResponse])
async def list_shop_returns(
    shop_id: int,
    response: Response,
    skip: int = skip_param(),
    limit: int = limit_param(),
    return_status: ReturnStatus | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Заявки на возврат по товарам одного магазина.

    Продавцу об оформленном возврате приходило уведомление, а посмотреть его
    было негде: список заявок доступен только платформе (RETURNS_MANAGE), и
    экрана в кабинете не существовало. Продавец узнавал, что возврат случился,
    и не мог узнать ни по какому товару, ни по какой причине.

    Решение по заявке остаётся за платформой — здесь только чтение.
    """
    await ensure_can_manage_shop(
        shop_id, current_user, db, staff_codes=STAFF_ORDERS,
        detail="You can only see returns of your own shops",
    )

    # Заявка привязана к строке заказа, магазин — к товару в ней.
    conditions = [Product.shop_base_id == shop_id]
    if return_status is not None:
        conditions.append(ReturnRequest.status == return_status)

    scoped = (
        select(ReturnRequest.id)
        .join(OrderItem, OrderItem.id == ReturnRequest.order_item_id)
        .join(Product, Product.id == OrderItem.product_id)
        .where(*conditions)
    )

    total = await db.execute(select(func.count()).select_from(scoped.subquery()))
    set_pagination_headers(response, total=total.scalar() or 0, skip=skip, limit=limit)

    result = await db.execute(
        select(ReturnRequest)
        .options(*_with_relations())
        .where(ReturnRequest.id.in_(scoped))
        .order_by(ReturnRequest.id.desc())
        .offset(skip)
        .limit(limit)
    )
    return [_to_response(row) for row in result.scalars().all()]


@router.get("/count")
async def pending_count(
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.RETURNS_MANAGE)),
):
    """Сколько заявок ждёт решения — для отметки в меню админки."""
    total = await db.execute(
        select(func.count(ReturnRequest.id)).where(ReturnRequest.status == ReturnStatus.pending)
    )
    return {"count": total.scalar() or 0}


@router.patch("/{request_id}/approve", response_model=ReturnResponse)
async def approve_return(
    request_id: int,
    payload: ReturnResolveRequest,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.RETURNS_MANAGE)),
):
    """
    Подтвердить возврат: платформа согласна принять товар назад.

    Остаток здесь не меняется — товар ещё у покупателя. Он возвращается в
    остаток, когда его получат и осмотрят (PATCH /returns/{id}/receive).
    """
    request = await _load(db, request_id)
    if request is None:
        raise HTTPException(status_code=404, detail="Return request not found")
    if request.status != ReturnStatus.pending:
        raise HTTPException(status_code=400, detail="Return request is already resolved")

    request.status = ReturnStatus.approved
    request.resolution_comment = payload.resolution_comment or None
    order_item = request.order_item

    await notify(
        db,
        user_id=request.user_id,
        kind=NotificationKind.return_approved,
        entity_id=request.id,
        comment=request.resolution_comment,
    )
    # И владельцу: товар едет назад. Магазину FBS его получать самому.
    if order_item is not None and order_item.product is not None:
        await notify_shop_owner(
            db,
            shop_base_id=order_item.product.shop_base_id,
            kind=NotificationKind.return_received,
            entity_id=request.id,
        )
    await db.commit()

    return _to_response(await _load(db, request_id))


@router.patch("/{request_id}/receive", response_model=ReturnResponse)
async def receive_return(
    request_id: int,
    payload: ReturnReceiveRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Товар по одобренному возврату получен назад.

    Получает тот, у кого товар хранится: часть FBS — продавец, часть FBO —
    склад Postshop (сотрудник). restock=true — товар цел и возвращается в
    остаток; false — брак, остаток не меняется.
    """
    request = await _load(db, request_id)
    if request is None:
        raise HTTPException(status_code=404, detail="Return request not found")
    if request.status != ReturnStatus.approved:
        raise HTTPException(status_code=400, detail="Only an approved return can be received")
    if request.received_at is not None:
        raise HTTPException(status_code=400, detail="Return is already received")

    item_result = await db.execute(
        select(OrderItem)
        .options(selectinload(OrderItem.order_shop), selectinload(OrderItem.product))
        .where(OrderItem.id == request.order_item_id)
    )
    order_item = item_result.scalar_one_or_none()
    if order_item is None or order_item.order_shop is None:
        raise HTTPException(status_code=404, detail="Purchase of this return not found")

    is_staff_user = has_permission(current_user, Perm.RETURNS_MANAGE)
    if order_item.order_shop.warehouse_type == WarehouseType.fbo:
        if not is_staff_user:
            raise HTTPException(
                status_code=403,
                detail="FBO returns are received by the Postshop warehouse",
            )
    elif not is_staff_user:
        await ensure_can_manage_shop(
            order_item.order_shop.shop_base_id, current_user, db,
            staff_codes=STAFF_ORDERS,
            detail="You can only receive returns of your own shops",
        )

    if payload.restock:
        await record_return_from_customer(db, order_item, request.quantity)
    request.received_at = datetime.now(timezone.utc)
    request.restocked = payload.restock
    await db.commit()
    return _to_response(await _load(db, request_id))


@router.patch("/{request_id}/reject", response_model=ReturnResponse)
async def reject_return(
    request_id: int,
    payload: ReturnRejectRequest,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.RETURNS_MANAGE)),
):
    """
    Отказать в возврате с причиной.

    Причина обязательна: без неё заявка закрывается молча, и покупатель не
    понимает ни решения, ни что делать дальше.
    """
    request = await _load(db, request_id)
    if request is None:
        raise HTTPException(status_code=404, detail="Return request not found")
    if request.status != ReturnStatus.pending:
        raise HTTPException(status_code=400, detail="Return request is already resolved")

    request.status = ReturnStatus.rejected
    request.resolution_comment = payload.resolution_comment

    await notify(
        db,
        user_id=request.user_id,
        kind=NotificationKind.return_rejected,
        entity_id=request.id,
        comment=request.resolution_comment,
    )
    await db.commit()

    return _to_response(await _load(db, request_id))
