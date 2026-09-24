from pydantic import BaseModel
from datetime import datetime
from app.models.order_status import OrderStatusCode
from app.schemas.common import LangCode, Name100


class TranslationInput(BaseModel):
    language: LangCode
    name:     Name100


class OrderStatusTranslationResponse(BaseModel):
    language: str
    name:     str

    class Config:
        from_attributes = True


class OrderStatusResponse(BaseModel):
    id:           int
    code:         OrderStatusCode
    translations: list[OrderStatusTranslationResponse]
    # Записать этот флаг нечем, и не должно быть: статусы заказа — системный
    # конечный автомат (pending, processing, completed, rejected), на который
    # опирается списание со склада. Отключение любого из них сломало бы
    # обработку заказов, поэтому значение всегда true. Поле оставлено в ответе,
    # чтобы не ломать мобильное приложение.
    is_active:    bool
    created_at:   datetime
    updated_at:   datetime | None

    class Config:
        from_attributes = True
