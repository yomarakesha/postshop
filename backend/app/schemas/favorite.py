from pydantic import BaseModel
from datetime import datetime

from app.schemas.product import ProductResponse


class FavoriteResponse(BaseModel):
    id:           int
    product:      ProductResponse
    created_at:   datetime
    # Как и в корзине: запись остаётся, но помечается недоступной.
    is_available: bool = True

    class Config:
        from_attributes = True
