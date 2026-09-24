from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Region(Base):
    __tablename__ = "regions"

    id         = Column(Integer, primary_key=True, index=True)
    country_id = Column(Integer, ForeignKey("countries.id"), nullable=False)
    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    country      = relationship("Country", back_populates="regions")
    cities       = relationship("City", back_populates="region")
    translations = relationship("RegionTranslation", back_populates="region", cascade="all, delete-orphan")