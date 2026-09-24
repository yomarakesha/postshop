from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.schemas.common import AddressRequired500, Name100


class UserAddressCreateRequest(BaseModel):
    title: Name100
    address: AddressRequired500
    # Первый адрес становится основным сам — держать пользователя за руку тут
    # незачем; флаг нужен, только если основным делают сразу не первый.
    is_default: bool = False


class UserAddressUpdateRequest(BaseModel):
    title: Optional[Name100] = None
    address: Optional[AddressRequired500] = None


class UserAddressResponse(BaseModel):
    id: int
    title: str
    address: str
    is_default: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
