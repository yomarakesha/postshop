from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.favorite import Favorite
from app.models.currency import Currency
from app.models.measure_unit import MeasureUnit
from app.models.product import Product, ProductStatus
from app.models.user import User
from app.schemas.favorite import FavoriteResponse
from app.core.dependencies import require_permissions
from app.core.permissions import Perm
from app.core.visibility import visible_to_customer, unavailable_product_ids, unavailable_reason

router = APIRouter()


def _favorite_query(user_id: int):
    return (
        select(Favorite)
        .where(Favorite.user_id == user_id)
        .options(
            selectinload(Favorite.product).options(
                selectinload(Product.translations),
                selectinload(Product.brand),
                selectinload(Product.currency).selectinload(Currency.translations),
                selectinload(Product.measure_unit).selectinload(MeasureUnit.translations),
            )
        )
        .order_by(Favorite.created_at.desc())
    )


@router.get("/", response_model=list[FavoriteResponse])
async def get_favorites(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.FAVORITES_READ)),
):
    result = await db.execute(_favorite_query(current_user.id))
    favorites = list(result.scalars().all())

    unavailable = set(await unavailable_product_ids([f.product for f in favorites], db))
    responses = []
    for f in favorites:
        data = FavoriteResponse.model_validate(f)
        data.is_available = f.product_id not in unavailable
        responses.append(data)
    return responses


@router.post("/{product_id}", response_model=FavoriteResponse, status_code=status.HTTP_201_CREATED)
async def add_to_favorites(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.FAVORITES_MANAGE)),
):
    # Как и в корзине: товар закрытого магазина не должен попадать в избранное.
    visible = await visible_to_customer(select(Product), db)
    prod_res = await db.execute(visible.where(Product.id == product_id))
    if not prod_res.scalar_one_or_none():
        raise HTTPException(
            status_code=404, detail=await unavailable_reason(product_id, db)
        )

    existing_res = await db.execute(
        select(Favorite).where(
            Favorite.user_id == current_user.id,
            Favorite.product_id == product_id,
        )
    )
    if existing_res.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Product already in favorites")

    favorite = Favorite(user_id=current_user.id, product_id=product_id)
    db.add(favorite)
    await db.flush()
    await db.commit()

    result = await db.execute(
        _favorite_query(current_user.id).where(Favorite.id == favorite.id)
    )
    return result.scalar_one()


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_favorites(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.FAVORITES_MANAGE)),
):
    result = await db.execute(
        select(Favorite).where(
            Favorite.user_id == current_user.id,
            Favorite.product_id == product_id,
        )
    )
    favorite = result.scalar_one_or_none()
    if not favorite:
        raise HTTPException(status_code=404, detail="Product not in favorites")
    await db.delete(favorite)
    await db.commit()
