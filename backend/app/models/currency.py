from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from app.core.utc_datetime import UTCDateTime


class Currency(Base):
    __tablename__ = "currencies"

    id         = Column(Integer, primary_key=True, index=True)
    code       = Column(String(10), unique=True, nullable=False, index=True)  # e.g. usd, rub, tmt
    is_active  = Column(Boolean, default=True)
    created_at = Column(UTCDateTime(), server_default=func.now())
    updated_at = Column(UTCDateTime(), onupdate=func.now())

    translations = relationship("CurrencyTranslation", back_populates="currency", cascade="all, delete-orphan")