from decimal import Decimal, ROUND_HALF_UP
from sqlalchemy import UniqueConstraint, Column, Integer, Boolean, ForeignKey, Enum, Numeric, JSON, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum
from app.core.utc_datetime import UTCDateTime



class DiscountType(str, enum.Enum):
    percentage = "percentage"
    fixed = "fixed"


class ProductStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    declined = "declined"


def effective_price(product) -> Decimal:
    """Итоговая цена товара с учётом скидки (Python-эквивалент _effective_price_expr).

    Округляет до 2 знаков и не опускается ниже нуля.
    """
    price = Decimal(product.price)
    if product.discount is None or product.discount_type is None:
        return price.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    discount = Decimal(product.discount)
    if product.discount_type == DiscountType.percentage:
        result = price * (Decimal(1) - discount / Decimal(100))
    else:  # fixed
        result = price - discount

    if result < 0:
        result = Decimal(0)
    return result.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (
        UniqueConstraint("barcode", name="uq_products_barcode"),
        UniqueConstraint("shop_base_id", "vendor_barcode", name="uq_product_shop_vendor_barcode"),
    )

    id           = Column(Integer, primary_key=True, index=True)
    category_id     = Column(Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False)
    shop_base_id    = Column(Integer, ForeignKey("shop_bases.id", ondelete="CASCADE"), nullable=False)
    brand_id        = Column(Integer, ForeignKey("brands.id", ondelete="SET NULL"), nullable=True)
    measure_unit_id = Column(Integer, ForeignKey("measure_units.id", ondelete="RESTRICT"), nullable=False)

    hashtag      = Column(String(255), nullable=True)
    # Штрихкод Postshop (выдаёт платформа) и заводской штрихкод продавца —
    # см. app/services/barcode.py.
    barcode        = Column(String(13), nullable=True)
    vendor_barcode = Column(String(14), nullable=True)
    images       = Column(JSON, default=list)

    price         = Column(Numeric(10, 2), nullable=False)
    currency_id   = Column(Integer, ForeignKey("currencies.id", ondelete="SET NULL"), nullable=True)
    discount_type = Column(Enum(DiscountType), nullable=True)
    discount      = Column(Numeric(10, 2), nullable=True)

    # Агрегаты рейтинга. Лежат тут, а не считаются на каждой выдаче, потому что
    # товары отдаются десятком разных методов (каталог, поиск, похожие, подборки,
    # свои товары) — подзапрос пришлось бы добавить в каждый и ни один не забыть.
    # Пересчитываются целиком из подтверждённых отзывов (см. reviews.py), поэтому
    # разъехаться с ними не могут.
    rating_avg   = Column(Numeric(3, 2), nullable=True)
    rating_count = Column(Integer, nullable=False, default=0)

    # Сколько раз открывали карточку товара. Считается по обращениям к выдаче
    # одного товара, то есть включает и повторные заходы того же человека, и
    # обходчиков: точного числа людей это не даёт и не должно — метрика нужна
    # для сравнения товаров между собой, а не для абсолютной правды.
    views_count  = Column(Integer, nullable=False, default=0, server_default="0")

    is_active  = Column(Boolean, default=True)
    status     = Column(Enum(ProductStatus), default=ProductStatus.pending, nullable=False, index=True)
    moderation_comment = Column(String(500), nullable=True)
    created_at = Column(UTCDateTime(), server_default=func.now())
    updated_at = Column(UTCDateTime(), onupdate=func.now())

    category     = relationship("Category")
    shop_base    = relationship("ShopBase")
    brand        = relationship("Brand")
    currency     = relationship("Currency")
    measure_unit = relationship("MeasureUnit")
    translations = relationship("ProductTranslation", back_populates="product", cascade="all, delete-orphan")
