from sqlalchemy import Column, Integer, ForeignKey, Enum, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from app.models.shop_additional import WarehouseType
import enum
from app.core.utc_datetime import UTCDateTime


class LocalOrderStatusCode(str, enum.Enum):
    """Локальный статус части заказа, относящейся к одному магазину."""
    pending       = "pending"
    approved      = "approved"
    rejected      = "rejected"
    ready_to_take = "ready_to_take"


class OrderShop(Base):
    """Часть заказа, относящаяся к одному магазину (суб-заказ).

    Один заказ покупателя распадается на несколько OrderShop — по одному
    на каждый магазин, чьи товары есть в заказе. У каждого свой локальный
    статус, который магазин меняет независимо (частичное выполнение).
    """
    __tablename__ = "order_shops"
    __table_args__ = (
        UniqueConstraint("order_id", "shop_base_id", name="uq_order_shop"),
    )

    id           = Column(Integer, primary_key=True, index=True)
    order_id     = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    shop_base_id = Column(Integer, ForeignKey("shop_bases.id", ondelete="RESTRICT"), nullable=False, index=True)
    status       = Column(Enum(LocalOrderStatusCode), nullable=False, default=LocalOrderStatusCode.pending)
    comment      = Column(Text, nullable=True)

    # Снимок способа фулфилмента магазина на момент создания заказа: тип магазина
    # могут поменять позже, а списание остатка должно идти по тому, что было тогда.
    # NULL — тип у магазина не задан, складская логика к этой части не применяется.
    warehouse_type = Column(Enum(WarehouseType), nullable=True)
    # Задел под FBO: с какого склада платформы обслуживается эта часть заказа.
    # Для FBS не используется и остаётся NULL.
    warehouse_id   = Column(Integer, ForeignKey("warehouses.id", ondelete="SET NULL"), nullable=True)

    created_at   = Column(UTCDateTime(), server_default=func.now())
    updated_at   = Column(UTCDateTime(), onupdate=func.now())

    order     = relationship("Order", back_populates="order_shops")
    shop_base = relationship("ShopBase")
    items     = relationship("OrderItem", back_populates="order_shop")

    @property
    def shop(self):
        """Алиас для отдачи магазина в ответе (ShopFullResponse)."""
        return self.shop_base
