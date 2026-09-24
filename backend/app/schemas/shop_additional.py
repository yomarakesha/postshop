from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from app.models.shop_additional import WarehouseType
from app.schemas.city import CityResponse
from app.schemas.common import Color50, Description2000, Name255


class ShopAdditionalResponse(BaseModel):
    id: int
    shop_base_id: int
    city_id: Optional[int] = None
    city: Optional[CityResponse] = None
    warehouse_type: Optional[WarehouseType] = None
    name: Optional[Name255] = None
    description: Optional[Description2000] = None
    addresses: List[str] = []
    phone_numbers: List[str] = []
    color: Optional[Color50] = None
    color_text: Optional[Color50] = None
    logo_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True


class ShopAdditionalUpdate(BaseModel):
    city_id: Optional[int] = None
    warehouse_type: Optional[WarehouseType] = None
    name: Optional[str] = None
    description: Optional[str] = None
    addresses: Optional[List[str]] = Field(None, max_length=20)
    phone_numbers: Optional[List[str]] = Field(None, max_length=10)
    color: Optional[str] = None
    color_text: Optional[str] = None
