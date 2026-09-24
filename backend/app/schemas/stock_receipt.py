from pydantic import BaseModel, field_validator
from datetime import datetime
from decimal import Decimal
from app.models.stock_receipt import ReceiptStatus
from app.schemas.common import QuantityDec


class StockReceiptCreate(BaseModel):
    shop_id:      int
    warehouse_id: int


class StockReceiptItemCreate(BaseModel):
    product_id:      int
    measure_unit_id: int
    quantity:        QuantityDec

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("quantity must be greater than 0")
        return v


class MeasureUnitShort(BaseModel):
    id:   int
    code: str

    class Config:
        from_attributes = True


class StockReceiptItemResponse(BaseModel):
    id:           int
    product_id:   int
    measure_unit: MeasureUnitShort
    quantity:     Decimal
    product_name: str | None = None

    class Config:
        from_attributes = True


class StockReceiptResponse(BaseModel):
    id:             int
    shop_id:        int
    warehouse_id:   int
    status:         ReceiptStatus
    created_at:     datetime
    confirmed_at:   datetime | None
    items:          list[StockReceiptItemResponse]
    shop_name:      str | None = None
    warehouse_name: str | None = None

    class Config:
        from_attributes = True
