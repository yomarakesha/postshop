from sqlalchemy import Column, Integer, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum
from app.core.utc_datetime import UTCDateTime


class OrderStatusCode(str, enum.Enum):
    pending          = "pending"
    approved         = "approved"
    rejected         = "rejected"
    ready_to_take    = "ready_to_take"
    ready_to_deliver = "ready_to_deliver"
    completed        = "completed"


class OrderStatus(Base):
    __tablename__ = "order_statuses"

    id         = Column(Integer, primary_key=True, index=True)
    code       = Column(Enum(OrderStatusCode), unique=True, nullable=False, index=True)
    is_active  = Column(Boolean, default=True)
    created_at = Column(UTCDateTime(), server_default=func.now())
    updated_at = Column(UTCDateTime(), onupdate=func.now())

    translations = relationship("OrderStatusTranslation", back_populates="order_status", cascade="all, delete-orphan")
