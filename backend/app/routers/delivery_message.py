from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.delivery_message import DeliveryMessage
from app.models.delivery_message_translation import DeliveryMessageTranslation
from app.schemas.delivery_message import DeliveryMessageCreate, DeliveryMessageUpdate, DeliveryMessageResponse
from app.core.dependencies import require_permissions
from app.core.permissions import Perm

router = APIRouter()

SINGLETON_ID = 1


def _query():
    return select(DeliveryMessage).options(selectinload(DeliveryMessage.translations))


async def get_instance(db: AsyncSession) -> DeliveryMessage | None:
    result = await db.execute(_query().where(DeliveryMessage.id == SINGLETON_ID))
    return result.scalar_one_or_none()


@router.post("/", response_model=DeliveryMessageResponse, status_code=status.HTTP_201_CREATED)
async def create_delivery_message(
    body: DeliveryMessageCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.DELIVERY_MESSAGE_CREATE)),
):
    if await get_instance(db):
        raise HTTPException(status_code=409, detail="Delivery message already exists. Use PUT to update it.")
    if not body.translations:
        raise HTTPException(status_code=400, detail="At least one translation is required")

    instance = DeliveryMessage(id=SINGLETON_ID)
    db.add(instance)
    await db.flush()

    for t in body.translations:
        db.add(DeliveryMessageTranslation(delivery_message_id=instance.id, language=t.language, text=t.text))

    await db.commit()
    return (await db.execute(_query().where(DeliveryMessage.id == SINGLETON_ID))).scalar_one()


@router.get("/", response_model=DeliveryMessageResponse)
async def read_delivery_message(
    db: AsyncSession = Depends(get_db),
):
    instance = await get_instance(db)
    if not instance:
        raise HTTPException(status_code=404, detail="Delivery message not found")
    return instance


@router.put("/", response_model=DeliveryMessageResponse)
async def update_delivery_message(
    body: DeliveryMessageUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.DELIVERY_MESSAGE_UPDATE)),
):
    instance = await get_instance(db)
    if not instance:
        raise HTTPException(status_code=404, detail="Delivery message not found. Use POST to create it first.")

    if body.translations is not None:
        existing = {t.language: t for t in instance.translations}
        for t in body.translations:
            if t.language in existing:
                existing[t.language].text = t.text
            else:
                db.add(DeliveryMessageTranslation(delivery_message_id=instance.id, language=t.language, text=t.text))

    await db.commit()
    return (await db.execute(_query().where(DeliveryMessage.id == SINGLETON_ID))).scalar_one()
