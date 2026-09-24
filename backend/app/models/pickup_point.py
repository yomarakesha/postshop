from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class PickupPoint(Base):
    __tablename__ = "pickup_points"

    id         = Column(Integer, primary_key=True, index=True)
    city_id    = Column(Integer, ForeignKey("cities.id", ondelete="RESTRICT"), nullable=False)
    name       = Column(String(255), nullable=False)
    address    = Column(Text, nullable=False)
    latitude   = Column(Numeric(10, 7), nullable=False)
    longitude  = Column(Numeric(10, 7), nullable=False)
    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    city = relationship("City")
