from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

from app.schemas.product import ProductResponse
from app.schemas.common import QuantityInt


class CartItemAdd(BaseModel):
    product_id: int
    quantity: QuantityInt = 1


class CartItemUpdate(BaseModel):
    quantity: QuantityInt


class CartItemResponse(BaseModel):
    id: int
    product: ProductResponse
    quantity: int
    created_at: datetime
    # Позиция остаётся в корзине, даже если товар стал недоступен (магазин
    # закрылся, товар сняли с продажи). Молча её удалять нельзя — покупатель
    # не поймёт, куда пропал товар и почему заказ не оформляется.
    is_available: bool = True

    class Config:
        from_attributes = True


class CartShopGroup(BaseModel):
    shop_base_id: int
    shop_name: Optional[str] = None
    shop_logo_path: Optional[str] = None
    items: List[CartItemResponse]


class CartResponse(BaseModel):
    groups: List[CartShopGroup]
    total_items: int
