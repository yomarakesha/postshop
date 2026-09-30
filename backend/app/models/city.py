from sqlalchemy import Column, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from app.core.utc_datetime import UTCDateTime


class City(Base):
    __tablename__ = "cities"

    id        = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(UTCDateTime(), server_default=func.now())
    updated_at = Column(UTCDateTime(), onupdate=func.now())

    region       = relationship("Region", back_populates="cities")
    translations = relationship("CityTranslation", back_populates="city", cascade="all, delete-orphan")