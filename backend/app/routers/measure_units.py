from fastapi import APIRouter, Depends, HTTPException, status, Response, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.core.pagination import limit_param, paginate, skip_param
from app.models.measure_unit import MeasureUnit
from app.models.measure_unit_translation import MeasureUnitTranslation
from app.schemas.measure_unit import MeasureUnitCreate, MeasureUnitUpdate, MeasureUnitResponse
from app.core.dependencies import require_permissions
from app.core.permissions import Perm

from app.core.search import normalize_term, text_matches, translation_matches
from typing import Optional
router = APIRouter()


def _unit_query():
    return select(MeasureUnit).options(selectinload(MeasureUnit.translations))


async def get_measure_unit_or_404(unit_id: int, db: AsyncSession) -> MeasureUnit:
    result = await db.execute(_unit_query().where(MeasureUnit.id == unit_id))
    unit = result.scalar_one_or_none()
    if not unit:
        raise HTTPException(status_code=404, detail="Measure unit not found")
    return unit


@router.post("/", response_model=MeasureUnitResponse, status_code=status.HTTP_201_CREATED)
async def create_measure_unit(
    payload: MeasureUnitCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.MEASURE_UNITS_CREATE))
):
    if not payload.translations:
        raise HTTPException(status_code=400, detail="At least one translation is required")

    result = await db.execute(select(MeasureUnit).where(MeasureUnit.code == payload.code))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"Measure unit with code '{payload.code}' already exists")

    unit = MeasureUnit(code=payload.code)
    db.add(unit)
    await db.flush()

    for t in payload.translations:
        db.add(MeasureUnitTranslation(measure_unit_id=unit.id, language=t.language, name=t.name))

    await db.commit()
    return await get_measure_unit_or_404(unit.id, db)


@router.get("/", response_model=list[MeasureUnitResponse])
async def get_measure_units(
    response: Response = None,  # type: ignore[assignment]
    skip: int = skip_param(),
    limit: int = limit_param(20),
    name: Optional[str] = Query(default=None, description="Фильтр по части названия"),
    db: AsyncSession = Depends(get_db),
):
    query = _unit_query()
    # Поля поиска в админке не было, потому что искать было нечем: параметра
    # у метода не существовало, и найти запись за пределами первой страницы
    # оказывалось невозможно.
    term = normalize_term(name)
    if term:
        query = query.where(translation_matches(MeasureUnitTranslation, MeasureUnit.id, term))

    result = await db.execute(await paginate(db, response, query, skip=skip, limit=limit))
    return result.scalars().all()


@router.get("/{unit_id}", response_model=MeasureUnitResponse)
async def get_measure_unit(
    unit_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.MEASURE_UNITS_READ))
):
    return await get_measure_unit_or_404(unit_id, db)


@router.put("/{unit_id}", response_model=MeasureUnitResponse)
async def update_measure_unit(
    unit_id: int,
    payload: MeasureUnitUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.MEASURE_UNITS_UPDATE))
):
    unit = await get_measure_unit_or_404(unit_id, db)

    if payload.code is not None:
        conflict = await db.execute(
            select(MeasureUnit).where(MeasureUnit.code == payload.code, MeasureUnit.id != unit_id)
        )
        if conflict.scalar_one_or_none():
            raise HTTPException(status_code=400, detail=f"Measure unit with code '{payload.code}' already exists")
        unit.code = payload.code

    if payload.translations:
        existing = {t.language: t for t in unit.translations}
        for t in payload.translations:
            if t.language in existing:
                existing[t.language].name = t.name
            else:
                db.add(MeasureUnitTranslation(measure_unit_id=unit.id, language=t.language, name=t.name))

    await db.commit()
    return await get_measure_unit_or_404(unit_id, db)


@router.patch("/{unit_id}/block", response_model=MeasureUnitResponse)
async def block_measure_unit(
    unit_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.MEASURE_UNITS_BLOCK))
):
    unit = await get_measure_unit_or_404(unit_id, db)
    if not unit.is_active:
        raise HTTPException(status_code=400, detail="Measure unit is already blocked")

    unit.is_active = False
    await db.commit()
    return await get_measure_unit_or_404(unit_id, db)


@router.patch("/{unit_id}/unblock", response_model=MeasureUnitResponse)
async def unblock_measure_unit(
    unit_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.MEASURE_UNITS_BLOCK))
):
    unit = await get_measure_unit_or_404(unit_id, db)
    if unit.is_active:
        raise HTTPException(status_code=400, detail="Measure unit is already active")

    unit.is_active = True
    await db.commit()
    return await get_measure_unit_or_404(unit_id, db)
