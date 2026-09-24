from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Country(Base):
    __tablename__ = "countries"

    id         = Column(Integer, primary_key=True, index=True)
    iso_code   = Column(String(3), unique=True, nullable=False, index=True)
    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    regions      = relationship("Region", back_populates="country")
    translations = relationship("CountryTranslation", back_populates="country", cascade="all, delete-orphan")