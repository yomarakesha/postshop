from pydantic import BaseModel

from app.models.shop_base import RegistrationStatus
from app.models.order_status import OrderStatusCode


class ShopStatusCount(BaseModel):
    status: RegistrationStatus
    count:  int


class ShopsStatisticsResponse(BaseModel):
    total:      int
    by_status:  list[ShopStatusCount]


class ClientsStatisticsResponse(BaseModel):
    total: int


class OrderStatusCount(BaseModel):
    status: OrderStatusCode
    count:  int


class OrdersStatisticsResponse(BaseModel):
    total:      int
    by_status:  list[OrderStatusCount]
