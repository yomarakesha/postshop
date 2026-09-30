from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from app.core.utc_datetime import UTCDateTime


class Country(Base):
    __tablename__ = "countries"

    id         = Column(Integer, primary_key=True, index=True)
    iso_code   = Column(String(3), unique=True, nullable=False, index=True)
    is_active  = Column(Boolean, default=True)
    created_at = Column(UTCDateTime(), server_default=func.now())
    updated_at = Column(UTCDateTime(), onupdate=func.now())

    regions      = relationship("Region", back_populates="country")
    translations = relationship("CountryTranslation", back_populates="country", cascade="all, delete-orphan")