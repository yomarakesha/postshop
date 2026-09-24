from pydantic import BaseModel, field_validator
from datetime import datetime
from decimal import Decimal
from app.models.stock_operation import OperationType
from app.schemas.common import QuantityDec


class StockOperationCreate(BaseModel):
    shop_id:         int
    product_id:      int
    measure_unit_id: int
    operation_type:  OperationType
    quantity:        QuantityDec

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("quantity must be greater than 0")
        return v


class StockSetRequest(BaseModel):
    """
    Пересчёт: сколько товара доступно к продаже на самом деле.

    Продавец называет итог, а не разницу. Разницу считает сервер — и в этом
    весь смысл: между «посмотрел» и «сохранил» проходит минута, за которую
    товар успевают купить, и абсолютная запись с экрана затёрла бы эту продажу.

    Число — именно доступное к продаже: так подписан остаток на карточке, в
    уведомлении и на витрине. Товар под открытыми заказами лежит на складе
    сверх него.
    """

    shop_id:         int
    product_id:      int
    measure_unit_id: int
    quantity:        QuantityDec

    @field_validator("quantity")
    @classmethod
    def quantity_must_not_be_negative(cls, v: Decimal) -> Decimal:
        if v < 0:
            raise ValueError("quantity must be zero or greater")
        return v


class MeasureUnitShort(BaseModel):
    id:   int
    code: str

    class Config:
        from_attributes = True


class StockOperationResponse(BaseModel):
    id:             int
    shop_id:        int
    product_id:     int
    measure_unit:   MeasureUnitShort
    operation_type: OperationType
    quantity:       Decimal
    created_at:     datetime

    class Config:
        from_attributes = True


class ProductStockResponse(BaseModel):
    product_id: int
    balance:    Decimal
    operations: list[StockOperationResponse]


class ProductAvailability(BaseModel):
    """
    Сколько товара можно купить прямо сейчас.

    В ответе товара не было ни остатка, ни признака наличия, поэтому «в наличии
    N» не мог показать ни покупатель, ни продавец — при том что заказ по
    остатку проверяется, и покупатель узнавал о нехватке только отказом при
    оформлении.

    ``tracked=false`` означает, что магазин работает без складского учёта: тогда
    остаток не ограничивает покупку и показывать число бессмысленно.
    """
    product_id: int
    tracked:    bool
    available:  Decimal
