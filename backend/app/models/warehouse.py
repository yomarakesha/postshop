from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from app.database import Base


class Warehouse(Base):
    __tablename__ = "warehouses"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(255), nullable=False)
    address       = Column(Text, nullable=False)
    phone_numbers = Column(JSON, default=list)
    is_active     = Column(Boolean, default=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), onupdate=func.now())
