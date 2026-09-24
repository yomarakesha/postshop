from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class CountryTranslation(Base):
    __tablename__ = "country_translations"

    id         = Column(Integer, primary_key=True, index=True)
    country_id = Column(Integer, ForeignKey("countries.id", ondelete="CASCADE"), nullable=False)
    language   = Column(String(10), nullable=False)  # "en", "ru", "tk", "tr", etc.
    name       = Column(String(100), nullable=False)

    country = relationship("Country", back_populates="translations")

    __table_args__ = (
        UniqueConstraint("country_id", "language", name="uq_country_language"),
    )
