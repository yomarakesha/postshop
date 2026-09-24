from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class CurrencyTranslation(Base):
    __tablename__ = "currency_translations"

    id          = Column(Integer, primary_key=True, index=True)
    currency_id = Column(Integer, ForeignKey("currencies.id", ondelete="CASCADE"), nullable=False)
    language    = Column(String(10), nullable=False)  # "en", "ru", "tk", "tr", etc.
    name        = Column(String(100), nullable=False)

    currency = relationship("Currency", back_populates="translations")

    __table_args__ = (
        UniqueConstraint("currency_id", "language", name="uq_currency_language"),
    )
