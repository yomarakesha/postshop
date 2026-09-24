from fastapi import APIRouter, Depends, HTTPException, status, Response, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.core.pagination import limit_param, paginate, skip_param
from app.models.city import City
from app.models.city_translation import CityTranslation
from app.models.region import Region
from app.models.country import Country
from app.schemas.city import CityCreate, CityUpdate, CityResponse
from app.core.dependencies import require_permissions
from app.core.permissions import Perm

from app.core.search import normalize_term, text_matches, translation_matches
from typing import Optional
router = APIRouter()


def _city_query():
    return select(City).options(
        selectinload(City.translations),
        selectinload(City.region).options(
            selectinload(Region.translations),
            selectinload(Region.country).selectinload(Country.translations),
        ),
    )


async def get_city_or_404(city_id: int, db: AsyncSession) -> City:
    result = await db.execute(_city_query().where(City.id == city_id))
    city = result.scalar_one_or_none()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    return city


async def get_active_region_or_404(region_id: int, db: AsyncSession) -> Region:
    result = await db.execute(
        select(Region)
        .options(selectinload(Region.country))
        .where(Region.id == region_id)
    )
    region = result.scalar_one_or_none()
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")
    if not region.is_active:
        raise HTTPException(status_code=400, detail="Region is blocked")
    if not region.country.is_active:
        raise HTTPException(status_code=400, detail="Region's country is blocked")
    return region


async def _check_duplicate_translations(region_id: int, translations: list, db: AsyncSession, exclude_city_id: int | None = None):
    for t in translations:
        query = (
            select(City)
            .join(CityTranslation, CityTranslation.city_id == City.id)
            .where(
                City.region_id == region_id,
                CityTranslation.language == t.language,
                CityTranslation.name == t.name,
            )
        )
        if exclude_city_id:
            query = query.where(City.id != exclude_city_id)
        conflict = await db.execute(query)
        if conflict.scalar_one_or_none():
            raise HTTPException(
                status_code=400,
                detail=f"City with this name already exists in this region ({t.language})"
            )


@router.post("/", response_model=CityResponse, status_code=status.HTTP_201_CREATED)
async def create_city(
    payload: CityCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.CITIES_CREATE))
):
    if not payload.translations:
        raise HTTPException(status_code=400, detail="At least one translation is required")

    await get_active_region_or_404(payload.region_id, db)
    await _check_duplicate_translations(payload.region_id, payload.translations, db)

    city = City(region_id=payload.region_id)
    db.add(city)
    await db.flush()

    for t in payload.translations:
        db.add(CityTranslation(city_id=city.id, language=t.language, name=t.name))

    await db.commit()
    return await get_city_or_404(city.id, db)


@router.get("/", response_model=list[CityResponse])
async def get_cities(
    response: Response = None,  # type: ignore[assignment]
    skip: int = skip_param(),
    limit: int = limit_param(20),
    region_id: int | None = None,
    country_id: int | None = None,
    name: Optional[str] = Query(default=None, description="Фильтр по части названия"),
    db: AsyncSession = Depends(get_db),
):
    query = _city_query()
    if region_id:
        query = query.where(City.region_id == region_id)
    if country_id:
        query = query.join(City.region).where(Region.country_id == country_id)
    # Поля поиска в админке не было, потому что искать было нечем: параметра
    # у метода не существовало, и найти запись за пределами первой страницы
    # оказывалось невозможно.
    term = normalize_term(name)
    if term:
        query = query.where(translation_matches(CityTranslation, City.id, term))
    result = await db.execute(await paginate(db, response, query, skip=skip, limit=limit))
    return result.scalars().all()


@router.get("/{city_id}", response_model=CityResponse)
async def get_city(
    city_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.CITIES_READ))
):
    return await get_city_or_404(city_id, db)


@router.put("/{city_id}", response_model=CityResponse)
async def update_city(
    city_id: int,
    payload: CityUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.CITIES_UPDATE))
):
    city = await get_city_or_404(city_id, db)

    if payload.region_id is not None:
        await get_active_region_or_404(payload.region_id, db)
        city.region_id = payload.region_id

    if payload.translations:
        target_region_id = payload.region_id or city.region_id
        await _check_duplicate_translations(target_region_id, payload.translations, db, exclude_city_id=city_id)

        existing = {t.language: t for t in city.translations}
        for t in payload.translations:
            if t.language in existing:
                existing[t.language].name = t.name
            else:
                db.add(CityTranslation(city_id=city.id, language=t.language, name=t.name))

    await db.commit()
    return await get_city_or_404(city_id, db)


@router.patch("/{city_id}/block", response_model=CityResponse)
async def block_city(
    city_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.CITIES_BLOCK))
):
    city = await get_city_or_404(city_id, db)
    if not city.is_active:
        raise HTTPException(status_code=400, detail="City is already blocked")

    city.is_active = False
    await db.commit()
    return await get_city_or_404(city_id, db)


@router.patch("/{city_id}/unblock", response_model=CityResponse)
async def unblock_city(
    city_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.CITIES_BLOCK))
):
    city = await get_city_or_404(city_id, db)
    if city.is_active:
        raise HTTPException(status_code=400, detail="City is already active")

    if not city.region.is_active:
        raise HTTPException(status_code=400, detail="Cannot unblock: region is still blocked")
    if not city.region.country.is_active:
        raise HTTPException(status_code=400, detail="Cannot unblock: country is still blocked")

    city.is_active = True
    await db.commit()
    return await get_city_or_404(city_id, db)
