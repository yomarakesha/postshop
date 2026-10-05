
from pydantic import BaseModel, computed_field
from datetime import datetime
from typing import List, Optional
from decimal import Decimal
from app.models.product import DiscountType, ProductStatus, effective_price as compute_effective_price
from app.schemas.common import Description2000, LangCode, ModerationComment500, Name255


class MeasureUnitTranslationShort(BaseModel):
    language: str
    name:     str

    class Config:
        from_attributes = True


class MeasureUnitShort(BaseModel):
    id:           int
    code:         str
    translations: List[MeasureUnitTranslationShort]

    class Config:
        from_attributes = True


class BrandShort(BaseModel):
    id:         int
    name:       str
    image_path: Optional[str] = None

    class Config:
        from_attributes = True


class CurrencyTranslationShort(BaseModel):
    language: str
    name:     str

    class Config:
        from_attributes = True


class CurrencyShort(BaseModel):
    id:           int
    code:         str
    translations: List[CurrencyTranslationShort]

    class Config:
        from_attributes = True


class ProductTranslationInput(BaseModel):
    language: LangCode  # "en", "ru", "tk", "tr", etc.
    name: Name255
    description: Description2000


class ProductTranslationResponse(BaseModel):
    language: str
    name: str
    description: str

    class Config:
        from_attributes = True


class ProductDeclineRequest(BaseModel):
    moderation_comment: Optional[ModerationComment500] = None  # причина отклонения, видна владельцу


class ProductResponse(BaseModel):
    id:              int
    category_id:     int
    shop_base_id:    int
    # Город магазина. Нужен поиску: выдача больше не обрезается по городу, и
    # витрина отмечает товары, которые приедут из другого города.
    shop_city_id:    Optional[int] = None
    brand_id:        Optional[int] = None
    brand:           Optional[BrandShort] = None
    measure_unit_id: int
    measure_unit:    MeasureUnitShort
    translations:    List[ProductTranslationResponse]
    hashtag:      Optional[str] = None
    # Штрихкод Postshop (есть у каждого товара) и заводской, если продавец его
    # указал — см. app/services/barcode.py.
    barcode:        Optional[str] = None
    vendor_barcode: Optional[str] = None
    # Название магазина. Заполняется там, где его показывают рядом с товаром
    # без карточки магазина — в очереди модерации; в остальных выдачах пусто.
    shop_name:      Optional[str] = None
    images:       List[str] = []
    price:        Decimal
    currency_id:  Optional[int] = None
    currency:     Optional[CurrencyShort] = None
    discount_type: Optional[DiscountType] = None
    discount:     Optional[Decimal] = None
    # Рейтинг по подтверждённым отзывам. Отдаётся везде, где отдаётся товар,
    # потому что и в каталоге, и в поиске, и в подборках он нужен одинаково.
    rating_avg:   Optional[Decimal] = None
    rating_count: int = 0
    is_active:    bool
    # Снят с продажи сотрудником: вернуть в продажу владелец не может.
    blocked_by_staff: bool = False
    status:       ProductStatus
    moderation_comment: Optional[str] = None
    created_at:   datetime
    updated_at:   datetime | None

    @computed_field
    @property
    def effective_price(self) -> Decimal:
        """Итоговая цена с учётом скидки."""
        return compute_effective_price(self)

    class Config:
        from_attributes = True
