from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field

from app.models.return_request import ReturnStatus
from app.models.shop_additional import WarehouseType
from app.schemas.common import Comment1000


class ReturnCreateRequest(BaseModel):
    order_item_id: int
    # Больше, чем куплено, вернуть нельзя — проверка в методе, там известна
    # сама покупка.
    quantity: Decimal = Field(gt=0)
    reason: Comment1000


class ReturnResolveRequest(BaseModel):
    resolution_comment: Optional[Comment1000] = None


class ReturnReceiveRequest(BaseModel):
    # True — товар цел, возвращается в продажу (остаток растёт); False — брак.
    restock: bool


class ReturnRejectRequest(BaseModel):
    # При отказе причина обязательна: иначе заявка закрывается молча.
    resolution_comment: Comment1000


class ReturnResponse(BaseModel):
    id: int
    user_id: int
    # Кто именно просит возврат. В списке заявок админки был только номер
    # заказа: чтобы понять, с кем разговаривать, приходилось идти в другой
    # раздел и искать заказ там.
    buyer_name: Optional[str] = None
    buyer_phone: Optional[str] = None
    order_item_id: int
    order_id: Optional[int] = None
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    quantity: Decimal
    # Сумма к возврату: цена на момент заказа × количество.
    amount: Optional[Decimal] = None
    reason: str
    status: ReturnStatus
    resolution_comment: Optional[str] = None
    # Кто получает товар назад: FBS — продавец, FBO — склад Postshop.
    warehouse_type: Optional[WarehouseType] = None
    received_at: Optional[datetime] = None
    restocked: Optional[bool] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
