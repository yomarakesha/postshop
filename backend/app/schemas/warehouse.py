
from pydantic import Field


from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.schemas.common import Address500, Name255


class WarehouseCreate(BaseModel):
    name: Name255
    address: Address500
    phone_numbers: List[str] = Field([], max_length=10)


class WarehouseUpdate(BaseModel):
    name: Optional[Name255] = None
    address: Optional[Address500] = None
    phone_numbers: Optional[List[str]] = Field(None, max_length=10)


class WarehouseResponse(BaseModel):
    id: int
    name: str
    address: str
    phone_numbers: List[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True
