from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Currency(Base):
    __tablename__ = "currencies"

    id         = Column(Integer, primary_key=True, index=True)
    code       = Column(String(10), unique=True, nullable=False, index=True)  # e.g. usd, rub, tmt
    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    translations = relationship("CurrencyTranslation", back_populates="currency", cascade="all, delete-orphan")