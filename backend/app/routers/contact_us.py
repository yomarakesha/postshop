from fastapi import APIRouter, Depends, HTTPException, Query, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select

from app.database import get_db
from app.core.pagination import limit_param, paginate, skip_param
from app.models.contact_us import ContactUs
from app.schemas.contact_us import ContactUsCreate, ContactUsHandledUpdate, ContactUsResponse
from app.core.dependencies import require_permissions
from app.core.permissions import Perm

router = APIRouter()


@router.post("/", response_model=ContactUsResponse, status_code=status.HTTP_201_CREATED)
async def create_contact_us(
    body: ContactUsCreate,
    db: AsyncSession = Depends(get_db),
):
    instance = ContactUs(name=body.name, phone=body.phone, message=body.message)
    db.add(instance)
    await db.commit()
    await db.refresh(instance)
    return instance


@router.get("/", response_model=list[ContactUsResponse])
async def read_contact_us(
    response: Response = None,  # type: ignore[assignment]
    skip: int = skip_param(),
    limit: int = limit_param(20),
    is_handled: bool | None = Query(
        default=None, description="Только обработанные (true) или только новые (false)"
    ),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.CONTACT_US_READ)),
):
    query = select(ContactUs).order_by(ContactUs.created_at.desc())
    # Без фильтра оператор перечитывал весь список целиком, включая уже
    # разобранные обращения.
    if is_handled is not None:
        query = query.where(ContactUs.is_handled.is_(is_handled))

    result = await db.execute(await paginate(db, response, query, skip=skip, limit=limit))
    return result.scalars().all()


@router.patch("/{contact_id}/handled", response_model=ContactUsResponse)
async def set_contact_us_handled(
    contact_id: int,
    payload: ContactUsHandledUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.CONTACT_US_HANDLE)),
):
    """Отметить обращение обработанным или снять отметку."""
    result = await db.execute(select(ContactUs).where(ContactUs.id == contact_id))
    instance = result.scalar_one_or_none()
    if not instance:
        raise HTTPException(status_code=404, detail="Contact request not found")

    if instance.is_handled == payload.is_handled:
        raise HTTPException(
            status_code=400,
            detail="Contact request is already "
                   + ("handled" if payload.is_handled else "not handled"),
        )

    instance.is_handled = payload.is_handled
    instance.handled_at = func.now() if payload.is_handled else None
    await db.commit()
    await db.refresh(instance)
    return instance
