from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal
from typing import Optional
from app.schemas.city import CityResponse
from app.schemas.common import Address500, LatitudeDec, LongitudeDec, Name255


class PickupPointCreate(BaseModel):
    city_id:   int
    name:      Name255
    address:   Address500
    latitude:  LatitudeDec
    longitude: LongitudeDec


class PickupPointUpdate(BaseModel):
    city_id:   Optional[int]     = None
    name:      Optional[Name255]      = None
    address:   Optional[Address500]   = None
    latitude:  Optional[LatitudeDec]  = None
    longitude: Optional[LongitudeDec] = None


class PickupPointResponse(BaseModel):
    id:        int
    city_id:   int
    city:      CityResponse
    name:      str
    address:   str
    latitude:  Decimal
    longitude: Decimal
    is_active: bool
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True
