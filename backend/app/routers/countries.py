from fastapi import APIRouter, Depends, HTTPException, status, Response, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.core.pagination import limit_param, paginate, skip_param
from app.models.country import Country
from app.models.country_translation import CountryTranslation
from app.schemas.country import CountryCreate, CountryUpdate, CountryResponse
from app.core.dependencies import require_permissions
from app.core.permissions import Perm

from app.core.search import normalize_term, text_matches, translation_matches

from typing import Optional

router = APIRouter()


def _country_query():
    return select(Country).options(selectinload(Country.translations))


async def get_country_or_404(country_id: int, db: AsyncSession) -> Country:
    result = await db.execute(_country_query().where(Country.id == country_id))
    country = result.scalar_one_or_none()
    if not country:
        raise HTTPException(status_code=404, detail="Country not found")
    return country


@router.post("/", response_model=CountryResponse, status_code=status.HTTP_201_CREATED)
async def create_country(
    payload: CountryCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.COUNTRIES_CREATE))
):
    if not payload.translations:
        raise HTTPException(status_code=400, detail="At least one translation is required")

    result = await db.execute(select(Country).where(Country.iso_code == payload.iso_code))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"Country with ISO code '{payload.iso_code}' already exists")

    country = Country(iso_code=payload.iso_code)
    db.add(country)
    await db.flush()

    for t in payload.translations:
        db.add(CountryTranslation(country_id=country.id, language=t.language, name=t.name))

    await db.commit()
    return await get_country_or_404(country.id, db)


@router.get("/", response_model=list[CountryResponse])
async def get_countries(
    response: Response = None,  # type: ignore[assignment]
    skip: int = skip_param(),
    limit: int = limit_param(20),
    name: Optional[str] = Query(default=None, description="Фильтр по части названия"),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.COUNTRIES_READ))
):
    query = _country_query()
    # Поля поиска в админке не было, потому что искать было нечем: параметра у
    # метода не существовало, и найти запись за пределами первой страницы
    # оказывалось невозможно.
    term = normalize_term(name)
    if term:
        query = query.where(translation_matches(CountryTranslation, Country.id, term))

    result = await db.execute(await paginate(db, response, query, skip=skip, limit=limit))
    return result.scalars().all()


@router.get("/{country_id}", response_model=CountryResponse)
async def get_country(
    country_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.COUNTRIES_READ))
):
    return await get_country_or_404(country_id, db)


@router.put("/{country_id}", response_model=CountryResponse)
async def update_country(
    country_id: int,
    payload: CountryUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.COUNTRIES_UPDATE))
):
    country = await get_country_or_404(country_id, db)

    if payload.iso_code is not None:
        conflict = await db.execute(
            select(Country).where(Country.iso_code == payload.iso_code, Country.id != country_id)
        )
        if conflict.scalar_one_or_none():
            raise HTTPException(status_code=400, detail=f"ISO code '{payload.iso_code}' already in use")
        country.iso_code = payload.iso_code

    if payload.translations:
        existing = {t.language: t for t in country.translations}
        for t in payload.translations:
            if t.language in existing:
                existing[t.language].name = t.name
            else:
                db.add(CountryTranslation(country_id=country.id, language=t.language, name=t.name))

    await db.commit()
    return await get_country_or_404(country_id, db)


@router.patch("/{country_id}/block", response_model=CountryResponse)
async def block_country(
    country_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.COUNTRIES_BLOCK))
):
    country = await get_country_or_404(country_id, db)
    if not country.is_active:
        raise HTTPException(status_code=400, detail="Country is already blocked")

    country.is_active = False
    await db.commit()
    return await get_country_or_404(country_id, db)


@router.patch("/{country_id}/unblock", response_model=CountryResponse)
async def unblock_country(
    country_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.COUNTRIES_BLOCK))
):
    country = await get_country_or_404(country_id, db)
    if country.is_active:
        raise HTTPException(status_code=400, detail="Country is already active")

    country.is_active = True
    await db.commit()
    return await get_country_or_404(country_id, db)
