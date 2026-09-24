from fastapi import APIRouter, Depends, HTTPException, status, Response, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.core.pagination import limit_param, paginate, skip_param
from app.models.pickup_point import PickupPoint
from app.models.city import City
from app.models.region import Region
from app.models.country import Country
from app.schemas.pickup_point import PickupPointCreate, PickupPointUpdate, PickupPointResponse
from app.core.dependencies import require_permissions
from app.core.permissions import Perm

from app.core.search import normalize_term, text_matches, translation_matches
from typing import Optional
router = APIRouter()


def _pickup_point_query():
    return select(PickupPoint).options(
        selectinload(PickupPoint.city).options(
            selectinload(City.translations),
            selectinload(City.region).options(
                selectinload(Region.translations),
                selectinload(Region.country).selectinload(Country.translations),
            ),
        )
    )


async def get_pickup_point_or_404(pickup_point_id: int, db: AsyncSession) -> PickupPoint:
    result = await db.execute(_pickup_point_query().where(PickupPoint.id == pickup_point_id))
    point = result.scalar_one_or_none()
    if not point:
        raise HTTPException(status_code=404, detail="Pickup point not found")
    return point


@router.post("/", response_model=PickupPointResponse, status_code=status.HTTP_201_CREATED)
async def create_pickup_point(
    payload: PickupPointCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.PICKUP_POINTS_CREATE)),
):
    city_res = await db.execute(select(City).where(City.id == payload.city_id))
    city = city_res.scalar_one_or_none()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    if not city.is_active:
        raise HTTPException(status_code=400, detail="City is blocked")

    point = PickupPoint(
        city_id=payload.city_id,
        name=payload.name,
        address=payload.address,
        latitude=payload.latitude,
        longitude=payload.longitude,
    )
    db.add(point)
    await db.commit()
    return await get_pickup_point_or_404(point.id, db)


@router.get("/", response_model=list[PickupPointResponse])
async def get_pickup_points(
    response: Response = None,  # type: ignore[assignment]
    skip:    int           = skip_param(),
    limit:   int           = limit_param(20),
    city_id: int | None = None,
    name: Optional[str] = Query(default=None, description="Фильтр по части названия"),
    db: AsyncSession = Depends(get_db),
):
    query = _pickup_point_query()
    if city_id is not None:
        query = query.where(PickupPoint.city_id == city_id)
    # Поля поиска в админке не было, потому что искать было нечем: параметра
    # у метода не существовало, и найти запись за пределами первой страницы
    # оказывалось невозможно.
    term = normalize_term(name)
    if term:
        query = query.where(text_matches(term, PickupPoint.name, PickupPoint.address))
    result = await db.execute(await paginate(db, response, query, skip=skip, limit=limit))
    return result.scalars().all()


@router.get("/{pickup_point_id}", response_model=PickupPointResponse)
async def get_pickup_point(
    pickup_point_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.PICKUP_POINTS_READ)),
):
    return await get_pickup_point_or_404(pickup_point_id, db)


@router.put("/{pickup_point_id}", response_model=PickupPointResponse)
async def update_pickup_point(
    pickup_point_id: int,
    payload: PickupPointUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.PICKUP_POINTS_UPDATE)),
):
    point = await get_pickup_point_or_404(pickup_point_id, db)

    if payload.city_id is not None:
        city_res = await db.execute(select(City).where(City.id == payload.city_id))
        city = city_res.scalar_one_or_none()
        if not city:
            raise HTTPException(status_code=404, detail="City not found")
        if not city.is_active:
            raise HTTPException(status_code=400, detail="City is blocked")
        point.city_id = payload.city_id

    if payload.name is not None:
        point.name = payload.name
    if payload.address is not None:
        point.address = payload.address
    if payload.latitude is not None:
        point.latitude = payload.latitude
    if payload.longitude is not None:
        point.longitude = payload.longitude

    await db.commit()
    return await get_pickup_point_or_404(pickup_point_id, db)


@router.patch("/{pickup_point_id}/block", response_model=PickupPointResponse)
async def block_pickup_point(
    pickup_point_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.PICKUP_POINTS_BLOCK)),
):
    point = await get_pickup_point_or_404(pickup_point_id, db)
    if not point.is_active:
        raise HTTPException(status_code=400, detail="Pickup point is already blocked")
    point.is_active = False
    await db.commit()
    return await get_pickup_point_or_404(pickup_point_id, db)


@router.patch("/{pickup_point_id}/unblock", response_model=PickupPointResponse)
async def unblock_pickup_point(
    pickup_point_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.PICKUP_POINTS_BLOCK)),
):
    point = await get_pickup_point_or_404(pickup_point_id, db)
    if point.is_active:
        raise HTTPException(status_code=400, detail="Pickup point is already active")
    point.is_active = True
    await db.commit()
    return await get_pickup_point_or_404(pickup_point_id, db)
