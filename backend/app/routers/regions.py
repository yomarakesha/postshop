from fastapi import APIRouter, Depends, HTTPException, status, Response, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.core.pagination import limit_param, paginate, skip_param
from app.models.region import Region
from app.models.region_translation import RegionTranslation
from app.models.country import Country
from app.schemas.region import RegionCreate, RegionUpdate, RegionResponse
from app.core.dependencies import require_permissions
from app.core.permissions import Perm

from app.core.search import normalize_term, text_matches, translation_matches
from typing import Optional
router = APIRouter()


def _region_query():
    return select(Region).options(
        selectinload(Region.translations),
        selectinload(Region.country).selectinload(Country.translations),
    )


async def get_region_or_404(region_id: int, db: AsyncSession) -> Region:
    result = await db.execute(_region_query().where(Region.id == region_id))
    region = result.scalar_one_or_none()
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")
    return region


async def get_active_country_or_404(country_id: int, db: AsyncSession) -> Country:
    result = await db.execute(select(Country).where(Country.id == country_id))
    country = result.scalar_one_or_none()
    if not country:
        raise HTTPException(status_code=404, detail="Country not found")
    if not country.is_active:
        raise HTTPException(status_code=400, detail="Country is blocked")
    return country


async def _check_duplicate_translations(country_id: int, translations: list, db: AsyncSession, exclude_region_id: int | None = None):
    for t in translations:
        query = (
            select(Region)
            .join(RegionTranslation, RegionTranslation.region_id == Region.id)
            .where(
                Region.country_id == country_id,
                RegionTranslation.language == t.language,
                RegionTranslation.name == t.name,
            )
        )
        if exclude_region_id:
            query = query.where(Region.id != exclude_region_id)
        conflict = await db.execute(query)
        if conflict.scalar_one_or_none():
            raise HTTPException(
                status_code=400,
                detail=f"Region with this name already exists in this country ({t.language})"
            )


@router.post("/", response_model=RegionResponse, status_code=status.HTTP_201_CREATED)
async def create_region(
    payload: RegionCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.REGIONS_CREATE))
):
    if not payload.translations:
        raise HTTPException(status_code=400, detail="At least one translation is required")

    await get_active_country_or_404(payload.country_id, db)
    await _check_duplicate_translations(payload.country_id, payload.translations, db)

    region = Region(country_id=payload.country_id)
    db.add(region)
    await db.flush()

    for t in payload.translations:
        db.add(RegionTranslation(region_id=region.id, language=t.language, name=t.name))

    await db.commit()
    return await get_region_or_404(region.id, db)


@router.get("/", response_model=list[RegionResponse])
async def get_regions(
    response: Response = None,  # type: ignore[assignment]
    skip: int = skip_param(),
    limit: int = limit_param(20),
    country_id: int | None = None,
    name: Optional[str] = Query(default=None, description="Фильтр по части названия"),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.REGIONS_READ))
):
    query = _region_query()
    if country_id:
        query = query.where(Region.country_id == country_id)
    # Поля поиска в админке не было, потому что искать было нечем: параметра
    # у метода не существовало, и найти запись за пределами первой страницы
    # оказывалось невозможно.
    term = normalize_term(name)
    if term:
        query = query.where(translation_matches(RegionTranslation, Region.id, term))
    result = await db.execute(await paginate(db, response, query, skip=skip, limit=limit))
    return result.scalars().all()


@router.get("/{region_id}", response_model=RegionResponse)
async def get_region(
    region_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.REGIONS_READ))
):
    return await get_region_or_404(region_id, db)


@router.put("/{region_id}", response_model=RegionResponse)
async def update_region(
    region_id: int,
    payload: RegionUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.REGIONS_UPDATE))
):
    region = await get_region_or_404(region_id, db)

    if payload.country_id is not None:
        await get_active_country_or_404(payload.country_id, db)
        region.country_id = payload.country_id

    if payload.translations:
        target_country_id = payload.country_id or region.country_id
        await _check_duplicate_translations(target_country_id, payload.translations, db, exclude_region_id=region_id)

        existing = {t.language: t for t in region.translations}
        for t in payload.translations:
            if t.language in existing:
                existing[t.language].name = t.name
            else:
                db.add(RegionTranslation(region_id=region.id, language=t.language, name=t.name))

    await db.commit()
    return await get_region_or_404(region_id, db)


@router.patch("/{region_id}/block", response_model=RegionResponse)
async def block_region(
    region_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.REGIONS_BLOCK))
):
    region = await get_region_or_404(region_id, db)
    if not region.is_active:
        raise HTTPException(status_code=400, detail="Region is already blocked")

    region.is_active = False
    await db.commit()
    return await get_region_or_404(region_id, db)


@router.patch("/{region_id}/unblock", response_model=RegionResponse)
async def unblock_region(
    region_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.REGIONS_BLOCK))
):
    region = await get_region_or_404(region_id, db)
    if region.is_active:
        raise HTTPException(status_code=400, detail="Region is already active")

    if not region.country.is_active:
        raise HTTPException(status_code=400, detail="Cannot unblock: country is still blocked")

    region.is_active = True
    await db.commit()
    return await get_region_or_404(region_id, db)
