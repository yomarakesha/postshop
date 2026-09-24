from pydantic import BaseModel, field_validator
from datetime import datetime
from decimal import Decimal
from app.models.warehouse_operation import WarehouseOperationType
from app.schemas.product import ProductResponse
from app.schemas.measure_unit import MeasureUnitResponse


class WarehouseOperationCreate(BaseModel):
    warehouse_id:    int
    shop_id:         int
    product_id:      int
    measure_unit_id: int
    operation_type:  WarehouseOperationType
    quantity:        Decimal

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


class WarehouseOperationResponse(BaseModel):
    id:             int
    warehouse_id:   int
    shop_id:        int
    product_id:     int
    measure_unit:   MeasureUnitShort
    operation_type: WarehouseOperationType
    quantity:       Decimal
    created_at:     datetime

    class Config:
        from_attributes = True


class WarehouseStockResponse(BaseModel):
    warehouse_id: int
    product_id:   int
    balance:      Decimal
    operations:   list[WarehouseOperationResponse]


class WarehouseProductBalance(BaseModel):
    """Остаток одного товара на складе — строка сводки по складу."""
    product_id:    int
    product:       ProductResponse
    balance:       Decimal
    measure_unit:  MeasureUnitResponse | None = None
