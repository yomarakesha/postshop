from sqlalchemy import Column, Integer, Boolean, ForeignKey, Enum, Numeric, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum
from app.core.utc_datetime import UTCDateTime


class PaymentType(str, enum.Enum):
    cash          = "cash"
    card          = "card"
    cash_and_card = "cash_and_card"


class Order(Base):
    __tablename__ = "orders"

    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    order_status_id  = Column(Integer, ForeignKey("order_statuses.id", ondelete="RESTRICT"), nullable=False)
    payment_type     = Column(Enum(PaymentType), nullable=False)
    delivery_address = Column(Text, nullable=True)
    # Цена доставки: назначается админом при переводе заказа в approved.
    # NULL — ещё не назначена (pending) или не применима (самовывоз через pickup_point).
    delivery_price   = Column(Numeric(10, 2), nullable=True)
    pickup_point_id  = Column(Integer, ForeignKey("pickup_points.id", ondelete="SET NULL"), nullable=True)
    # Пожелание покупателя при оформлении. Решение платформы (причина отказа,
    # отметка отмены покупателем) — в status_comment: раньше оно затирало
    # пожелание, и продавец терял «позвоните перед доставкой».
    comment          = Column(Text, nullable=True)
    status_comment   = Column(Text, nullable=True)
    created_at       = Column(UTCDateTime(), server_default=func.now())
    updated_at       = Column(UTCDateTime(), onupdate=func.now())

    user         = relationship("User")
    order_status = relationship("OrderStatus")
    pickup_point = relationship("PickupPoint")
    items        = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    order_shops  = relationship("OrderShop", back_populates="order", cascade="all, delete-orphan")

    @property
    def shops(self):
        """Уникальные магазины (shop_base + additional), чьи товары есть в заказе."""
        seen: dict[int, object] = {}
        for item in self.items:
            shop_base = item.product.shop_base if item.product else None
            if shop_base is not None and shop_base.id not in seen:
                seen[shop_base.id] = shop_base
        return list(seen.values())


class OrderItem(Base):
    __tablename__ = "order_items"

    id             = Column(Integer, primary_key=True, index=True)
    order_id       = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    order_shop_id  = Column(Integer, ForeignKey("order_shops.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id     = Column(Integer, ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)
    quantity       = Column(Integer, nullable=False)
    price_at_order = Column(Numeric(10, 2), nullable=False)

    order      = relationship("Order", back_populates="items")
    order_shop = relationship("OrderShop", back_populates="items")
    product    = relationship("Product")
