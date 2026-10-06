from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, field_validator

from app.models.withdrawal_request import WithdrawalStatus
from app.schemas.common import QuantityDec


class WithdrawalItemCreate(BaseModel):
    product_id: int
    quantity:   QuantityDec

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("quantity must be greater than 0")
        return v


class WithdrawalCreate(BaseModel):
    shop_id: int
    items:   list[WithdrawalItemCreate] = Field(min_length=1, max_length=100)
    comment: Optional[str] = Field(default=None, max_length=1000)


class WithdrawalReject(BaseModel):
    # Причина обязательна: без неё отказ непонятен, и продавец не знает, что
    # делать дальше.
    resolution_comment: str = Field(min_length=1, max_length=1000)


class WithdrawalItemResponse(BaseModel):
    id:           int
    product_id:   int
    product_name: Optional[str] = None
    measure_unit_code: Optional[str] = None
    quantity:     Decimal


class WithdrawalResponse(BaseModel):
    id:                 int
    shop_id:            int
    shop_name:          Optional[str] = None
    status:             WithdrawalStatus
    comment:            Optional[str] = None
    resolution_comment: Optional[str] = None
    created_at:         Optional[datetime] = None
    resolved_at:        Optional[datetime] = None
    items:              list[WithdrawalItemResponse]
