from fastapi import APIRouter, Depends, HTTPException, Query, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.core.pagination import limit_param, paginate, skip_param
from app.models.collection import Collection
from app.models.collection_translation import CollectionTranslation
from app.models.currency import Currency
from app.models.measure_unit import MeasureUnit
from app.models.product import Product, ProductStatus
from app.models.product_translation import ProductTranslation
from app.schemas.collection import CollectionCreate, CollectionUpdate, CollectionResponse
from app.core.dependencies import require_permissions
from app.core.permissions import Perm
from app.core.visibility import unavailable_product_ids

from app.core.search import normalize_term, translation_matches
from typing import Optional
router = APIRouter()


def _collection_query():
    return select(Collection).options(
        selectinload(Collection.translations),
        selectinload(Collection.products).options(
            selectinload(Product.translations),
            selectinload(Product.brand),
            selectinload(Product.currency).selectinload(Currency.translations),
            selectinload(Product.measure_unit).selectinload(MeasureUnit.translations),
        ),
    )


async def get_collection_or_404(collection_id: int, db: AsyncSession) -> Collection:
    result = await db.execute(_collection_query().where(Collection.id == collection_id))
    collection = result.scalar_one_or_none()
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    return collection


async def _fetch_products(product_ids: list[int], db: AsyncSession) -> list[Product]:
    if not product_ids:
        return []
    result = await db.execute(
        select(Product).options(
            selectinload(Product.translations),
            selectinload(Product.brand),
            selectinload(Product.currency).selectinload(Currency.translations),
            selectinload(Product.measure_unit).selectinload(MeasureUnit.translations),
        ).where(Product.id.in_(product_ids))
    )
    found = result.scalars().all()
    missing = set(product_ids) - {p.id for p in found}
    if missing:
        raise HTTPException(status_code=404, detail=f"Products not found: {sorted(missing)}")
    return list(found)


def _build_response(
    collection: Collection,
    products_limit: int | None,
    hidden_ids: set[int] = frozenset(),
) -> CollectionResponse:
    # Показываем только то, что доступно покупателю. Проверки полей товара
    # не хватало: подборка продолжала показывать товары закрытых магазинов.
    products = [p for p in collection.products if p.id not in hidden_ids]
    if products_limit is not None:
        products = products[:products_limit]
    return CollectionResponse(
        id=collection.id,
        translations=collection.translations,
        is_active=collection.is_active,
        products=products,
        created_at=collection.created_at,
        updated_at=collection.updated_at,
    )


@router.post("/", response_model=CollectionResponse, status_code=status.HTTP_201_CREATED)
async def create_collection(
    payload: CollectionCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.COLLECTIONS_CREATE)),
):
    if not payload.translations:
        raise HTTPException(status_code=400, detail="At least one translation is required")

    products = await _fetch_products(payload.product_ids, db)

    collection = Collection(products=products)
    db.add(collection)
    await db.flush()

    for t in payload.translations:
        db.add(CollectionTranslation(collection_id=collection.id, language=t.language, name=t.name))

    await db.commit()
    return _build_response(await get_collection_or_404(collection.id, db), None)


@router.get("/", response_model=list[CollectionResponse])
async def get_collections(
    response: Response = None,  # type: ignore[assignment]
    skip: int = skip_param(),
    limit: int = limit_param(20),
    products_limit: int | None = Query(default=None, description="Максимум товаров в каждой коллекции"),
    name: Optional[str] = Query(default=None, description="Фильтр по части названия"),
    db: AsyncSession = Depends(get_db),
):
    query = _collection_query()
    # Поля поиска в админке не было, потому что искать было нечем: параметра
    # у метода не существовало, и найти запись за пределами первой страницы
    # оказывалось невозможно.
    term = normalize_term(name)
    if term:
        query = query.where(translation_matches(CollectionTranslation, Collection.id, term))

    result = await db.execute(await paginate(db, response, query, skip=skip, limit=limit))
    collections = result.scalars().all()
    hidden = set(await unavailable_product_ids(
        [p for c in collections for p in c.products], db
    ))
    return [_build_response(c, products_limit, hidden) for c in collections]


@router.get("/{collection_id}", response_model=CollectionResponse)
async def get_collection(
    collection_id: int,
    products_limit: int | None = Query(default=None, description="Максимум товаров в коллекции"),
    db: AsyncSession = Depends(get_db),
):
    collection = await get_collection_or_404(collection_id, db)
    hidden = set(await unavailable_product_ids(collection.products, db))
    return _build_response(collection, products_limit, hidden)


@router.put("/{collection_id}", response_model=CollectionResponse)
async def update_collection(
    collection_id: int,
    payload: CollectionUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.COLLECTIONS_UPDATE)),
):
    collection = await get_collection_or_404(collection_id, db)

    if payload.translations is not None:
        existing = {t.language: t for t in collection.translations}
        for t in payload.translations:
            if t.language in existing:
                existing[t.language].name = t.name
            else:
                db.add(CollectionTranslation(collection_id=collection.id, language=t.language, name=t.name))

    if payload.product_ids is not None:
        products = await _fetch_products(payload.product_ids, db)
        collection.products = products

    await db.commit()
    return _build_response(await get_collection_or_404(collection.id, db), None)


@router.patch("/{collection_id}/block", response_model=CollectionResponse)
async def block_collection(
    collection_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.COLLECTIONS_BLOCK)),
):
    collection = await get_collection_or_404(collection_id, db)
    if not collection.is_active:
        raise HTTPException(status_code=400, detail="Collection is already blocked")
    collection.is_active = False
    await db.commit()
    return _build_response(await get_collection_or_404(collection.id, db), None)


@router.patch("/{collection_id}/unblock", response_model=CollectionResponse)
async def unblock_collection(
    collection_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.COLLECTIONS_BLOCK)),
):
    collection = await get_collection_or_404(collection_id, db)
    if collection.is_active:
        raise HTTPException(status_code=400, detail="Collection is already active")
    collection.is_active = True
    await db.commit()
    return _build_response(await get_collection_or_404(collection.id, db), None)


@router.delete("/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_collection(
    collection_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.COLLECTIONS_DELETE)),
):
    collection = await get_collection_or_404(collection_id, db)
    await db.delete(collection)
    await db.commit()
