from fastapi import APIRouter, Depends, HTTPException, status, Response, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.core.pagination import limit_param, paginate, skip_param
from app.models.currency import Currency
from app.models.currency_translation import CurrencyTranslation
from app.schemas.currency import CurrencyCreate, CurrencyUpdate, CurrencyResponse
from app.core.dependencies import require_permissions
from app.core.permissions import Perm

from sqlalchemy import or_

from app.core.search import normalize_term, text_matches, translation_matches

from typing import Optional

router = APIRouter()


def _currency_query():
    return select(Currency).options(selectinload(Currency.translations))


async def get_currency_or_404(currency_id: int, db: AsyncSession) -> Currency:
    result = await db.execute(_currency_query().where(Currency.id == currency_id))
    currency = result.scalar_one_or_none()
    if not currency:
        raise HTTPException(status_code=404, detail="Currency not found")
    return currency


@router.post("/", response_model=CurrencyResponse, status_code=status.HTTP_201_CREATED)
async def create_currency(
    payload: CurrencyCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.CURRENCIES_CREATE))
):
    if not payload.translations:
        raise HTTPException(status_code=400, detail="At least one translation is required")

    result = await db.execute(select(Currency).where(Currency.code == payload.code))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"Currency with code '{payload.code}' already exists")

    currency = Currency(code=payload.code)
    db.add(currency)
    await db.flush()

    for t in payload.translations:
        db.add(CurrencyTranslation(currency_id=currency.id, language=t.language, name=t.name))

    await db.commit()
    return await get_currency_or_404(currency.id, db)


@router.get("/", response_model=list[CurrencyResponse])
async def get_currencies(
    response: Response = None,  # type: ignore[assignment]
    skip: int = skip_param(),
    limit: int = limit_param(20),
    name: Optional[str] = Query(default=None, description="Фильтр по части названия"),
    db: AsyncSession = Depends(get_db),
):
    query = _currency_query()
    # Поля поиска в админке не было, потому что искать было нечем: параметра у
    # метода не существовало, и найти запись за пределами первой страницы
    # оказывалось невозможно.
    term = normalize_term(name)
    if term:
        query = query.where(or_(translation_matches(CurrencyTranslation, Currency.id, term), text_matches(term, Currency.code)))

    result = await db.execute(await paginate(db, response, query, skip=skip, limit=limit))
    return result.scalars().all()


@router.get("/{currency_id}", response_model=CurrencyResponse)
async def get_currency(
    currency_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.CURRENCIES_READ))
):
    return await get_currency_or_404(currency_id, db)


@router.put("/{currency_id}", response_model=CurrencyResponse)
async def update_currency(
    currency_id: int,
    payload: CurrencyUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.CURRENCIES_UPDATE))
):
    currency = await get_currency_or_404(currency_id, db)

    if payload.code is not None:
        conflict = await db.execute(
            select(Currency).where(Currency.code == payload.code, Currency.id != currency_id)
        )
        if conflict.scalar_one_or_none():
            raise HTTPException(status_code=400, detail=f"Currency with code '{payload.code}' already exists")
        currency.code = payload.code

    if payload.translations:
        existing = {t.language: t for t in currency.translations}
        for t in payload.translations:
            if t.language in existing:
                existing[t.language].name = t.name
            else:
                db.add(CurrencyTranslation(currency_id=currency.id, language=t.language, name=t.name))

    await db.commit()
    return await get_currency_or_404(currency_id, db)


@router.patch("/{currency_id}/block", response_model=CurrencyResponse)
async def block_currency(
    currency_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.CURRENCIES_BLOCK))
):
    currency = await get_currency_or_404(currency_id, db)
    if not currency.is_active:
        raise HTTPException(status_code=400, detail="Currency is already blocked")

    currency.is_active = False
    await db.commit()
    return await get_currency_or_404(currency_id, db)


@router.patch("/{currency_id}/unblock", response_model=CurrencyResponse)
async def unblock_currency(
    currency_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.CURRENCIES_BLOCK))
):
    currency = await get_currency_or_404(currency_id, db)
    if currency.is_active:
        raise HTTPException(status_code=400, detail="Currency is already active")

    currency.is_active = True
    await db.commit()
    return await get_currency_or_404(currency_id, db)
