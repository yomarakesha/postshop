from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete as sql_delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.currency import Currency
from app.models.measure_unit import MeasureUnit
from app.models.product import Product, ProductStatus
from app.models.shop_additional import ShopAdditional
from app.schemas.cart import CartItemAdd, CartItemResponse, CartItemUpdate, CartResponse, CartShopGroup
from app.core.dependencies import require_permissions
from app.core.permissions import Perm
from app.core.visibility import visible_to_customer, unavailable_product_ids, unavailable_reason
from app.services.stock import available as stock_available, is_tracked
from app.models.user import User

router = APIRouter()


async def _get_or_create_cart(user_id: int, db: AsyncSession) -> Cart:
    result = await db.execute(select(Cart).where(Cart.user_id == user_id))
    cart = result.scalar_one_or_none()
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        await db.flush()
    return cart


async def _ensure_in_stock(db: AsyncSession, product_id: int, quantity: int) -> None:
    """Столько товара ещё можно купить.

    Остаток проверялся только при оформлении заказа: товар с надписью «нет в
    наличии» спокойно ложился в корзину, а отказ приходил в самом конце, после
    выбора доставки и оплаты. Проверяем там же, где кладём.

    Магазины без учёта (FBO при выключенном складе платформы) остаток не
    ограничивает — у них проверять нечего.
    """
    row = (await db.execute(
        select(Product.shop_base_id, ShopAdditional.warehouse_type)
        .outerjoin(ShopAdditional, ShopAdditional.shop_base_id == Product.shop_base_id)
        .where(Product.id == product_id)
    )).first()
    if row is None:
        return
    shop_id, warehouse_type = row
    if not is_tracked(warehouse_type):
        return

    left = await stock_available(db, shop_id, product_id, warehouse_type)
    if left < quantity:
        # Минус в остатке бывает (заказы держат больше, чем в журнале), но
        # покупателю «доступно −3» ничего не говорит: доступно ноль.
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient stock. Available: {max(left, 0)}, requested: {quantity}",
        )


def _cart_item_query(cart_id: int):
    return (
        select(CartItem)
        .where(CartItem.cart_id == cart_id)
        .options(
            selectinload(CartItem.product).options(
                selectinload(Product.translations),
                selectinload(Product.brand),
                selectinload(Product.currency).selectinload(Currency.translations),
                selectinload(Product.measure_unit).selectinload(MeasureUnit.translations),
            ),
        )
    )


@router.get("/", response_model=CartResponse)
async def get_cart(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.CART_READ)),
):
    cart = await _get_or_create_cart(current_user.id, db)
    await db.commit()

    result = await db.execute(_cart_item_query(cart.id))
    items = list(result.scalars().all())

    shop_base_ids = list({item.product.shop_base_id for item in items})
    shop_info_map: dict[int, ShopAdditional] = {}
    if shop_base_ids:
        sa_result = await db.execute(
            select(ShopAdditional).where(ShopAdditional.shop_base_id.in_(shop_base_ids))
        )
        for sa in sa_result.scalars().all():
            shop_info_map[sa.shop_base_id] = sa

    unavailable = set(await unavailable_product_ids([item.product for item in items], db))

    groups_dict: dict[int, list[CartItem]] = defaultdict(list)
    for item in items:
        groups_dict[item.product.shop_base_id].append(item)

    def _item_response(item: CartItem) -> CartItemResponse:
        data = CartItemResponse.model_validate(item)
        data.is_available = item.product_id not in unavailable
        return data

    groups = [
        CartShopGroup(
            shop_base_id=shop_base_id,
            shop_name=shop_info_map[shop_base_id].name if shop_base_id in shop_info_map else None,
            shop_logo_path=shop_info_map[shop_base_id].logo_path if shop_base_id in shop_info_map else None,
            items=[_item_response(i) for i in group_items],
        )
        for shop_base_id, group_items in groups_dict.items()
    ]

    return CartResponse(
        groups=groups,
        total_items=sum(item.quantity for item in items),
    )


@router.post("/", response_model=CartItemResponse, status_code=status.HTTP_201_CREATED)
async def add_to_cart(
    payload: CartItemAdd,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.CART_MANAGE)),
):
    # Проверялись только поля товара: товар закрытого магазина спокойно
    # добавлялся в корзину и доходил до заказа.
    visible = await visible_to_customer(select(Product), db)
    prod_res = await db.execute(visible.where(Product.id == payload.product_id))
    if not prod_res.scalar_one_or_none():
        raise HTTPException(
            status_code=404, detail=await unavailable_reason(payload.product_id, db)
        )

    cart = await _get_or_create_cart(current_user.id, db)

    existing_res = await db.execute(
        select(CartItem).where(
            CartItem.cart_id == cart.id,
            CartItem.product_id == payload.product_id,
        )
    )
    existing = existing_res.scalar_one_or_none()
    if existing:
        await _ensure_in_stock(db, payload.product_id, existing.quantity + payload.quantity)
        existing.quantity += payload.quantity
        await db.commit()
        result = await db.execute(
            _cart_item_query(cart.id).where(CartItem.id == existing.id)
        )
        return result.scalar_one()

    await _ensure_in_stock(db, payload.product_id, payload.quantity)

    item = CartItem(cart_id=cart.id, product_id=payload.product_id, quantity=payload.quantity)
    db.add(item)
    await db.flush()
    await db.commit()

    result = await db.execute(
        _cart_item_query(cart.id).where(CartItem.id == item.id)
    )
    return result.scalar_one()


@router.put("/{product_id}", response_model=CartItemResponse)
async def update_cart_item(
    product_id: int,
    payload: CartItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.CART_MANAGE)),
):
    cart = await _get_or_create_cart(current_user.id, db)

    result = await db.execute(
        _cart_item_query(cart.id).where(CartItem.product_id == product_id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found in cart")

    # Увеличение количества — то же самое добавление: остаток надо проверить.
    if payload.quantity > item.quantity:
        await _ensure_in_stock(db, product_id, payload.quantity)

    item.quantity = payload.quantity
    await db.commit()

    result = await db.execute(
        _cart_item_query(cart.id).where(CartItem.product_id == product_id)
    )
    return result.scalar_one()


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.CART_MANAGE)),
):
    cart = await _get_or_create_cart(current_user.id, db)
    await db.execute(sql_delete(CartItem).where(CartItem.cart_id == cart.id))
    await db.commit()


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_cart(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.CART_MANAGE)),
):
    cart = await _get_or_create_cart(current_user.id, db)

    result = await db.execute(
        select(CartItem).where(
            CartItem.cart_id == cart.id,
            CartItem.product_id == product_id,
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    await db.delete(item)
    await db.commit()
