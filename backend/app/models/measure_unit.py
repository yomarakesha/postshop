from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from app.core.utc_datetime import UTCDateTime


class MeasureUnit(Base):
    __tablename__ = "measure_units"

    id         = Column(Integer, primary_key=True, index=True)
    code       = Column(String(20), unique=True, nullable=False, index=True)  # e.g. kg, pcs, litre
    is_active  = Column(Boolean, default=True)
    created_at = Column(UTCDateTime(), server_default=func.now())
    updated_at = Column(UTCDateTime(), onupdate=func.now())

    translations = relationship("MeasureUnitTranslation", back_populates="measure_unit", cascade="all, delete-orphan")