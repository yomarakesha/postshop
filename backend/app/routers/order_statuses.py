from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.order_status import OrderStatus
from app.models.order_status_translation import OrderStatusTranslation
from app.schemas.order_status import OrderStatusResponse, TranslationInput
from app.core.dependencies import require_permissions
from app.core.permissions import Perm

router = APIRouter()


def _order_status_query():
    return select(OrderStatus).options(selectinload(OrderStatus.translations))


async def get_order_status_or_404(order_status_id: int, db: AsyncSession) -> OrderStatus:
    result = await db.execute(_order_status_query().where(OrderStatus.id == order_status_id))
    order_status = result.scalar_one_or_none()
    if not order_status:
        raise HTTPException(status_code=404, detail="Order status not found")
    return order_status


@router.get("/", response_model=list[OrderStatusResponse])
async def get_order_statuses(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(_order_status_query())
    return result.scalars().all()


@router.get("/{order_status_id}", response_model=OrderStatusResponse)
async def get_order_status(
    order_status_id: int,
    db: AsyncSession = Depends(get_db),
):
    return await get_order_status_or_404(order_status_id, db)


@router.put("/{order_status_id}/translations", response_model=OrderStatusResponse)
async def update_order_status_translations(
    order_status_id: int,
    translations:    list[TranslationInput],
    db:              AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.ORDER_STATUSES_UPDATE)),
):
    if not translations:
        raise HTTPException(status_code=400, detail="At least one translation is required")

    order_status = await get_order_status_or_404(order_status_id, db)

    existing = {t.language: t for t in order_status.translations}
    for t in translations:
        if t.language in existing:
            existing[t.language].name = t.name
        else:
            db.add(OrderStatusTranslation(
                order_status_id=order_status.id,
                language=t.language,
                name=t.name,
            ))

    await db.commit()
    return await get_order_status_or_404(order_status_id, db)
