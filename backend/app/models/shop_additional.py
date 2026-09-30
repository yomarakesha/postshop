from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum
from app.core.utc_datetime import UTCDateTime


class WarehouseType(str, enum.Enum):
    fbs = "fbs"
    fbo = "fbo"


class ShopAdditional(Base):
    __tablename__ = "shop_additionals"

    id = Column(Integer, primary_key=True, index=True)
    shop_base_id = Column(Integer, ForeignKey("shop_bases.id", ondelete="CASCADE"), nullable=False, unique=True)
    city_id = Column(Integer, ForeignKey("cities.id", ondelete="SET NULL"), nullable=True)
    # Тип склада обязателен: без него снимок в заказе копировал NULL и
    # списание пропускалось вовсе — учёт был выключен даже при включённом флаге.
    warehouse_type = Column(Enum(WarehouseType), nullable=False)
    name = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    addresses = Column(JSON, default=list)
    phone_numbers = Column(JSON, default=list)
    color = Column(String(50), nullable=True)
    color_text = Column(String(50), nullable=True)
    logo_path = Column(String(255), nullable=True)

    created_at = Column(UTCDateTime(), server_default=func.now())
    updated_at = Column(UTCDateTime(), onupdate=func.now())

    shop_base = relationship("ShopBase", back_populates="additional")
    city = relationship("City")
