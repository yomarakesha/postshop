from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class CityTranslation(Base):
    __tablename__ = "city_translations"

    id      = Column(Integer, primary_key=True, index=True)
    city_id = Column(Integer, ForeignKey("cities.id", ondelete="CASCADE"), nullable=False)
    language = Column(String(10), nullable=False)  # "en", "ru", "tk", "tr", etc.
    name    = Column(String(100), nullable=False)

    city = relationship("City", back_populates="translations")

    __table_args__ = (
        UniqueConstraint("city_id", "language", name="uq_city_language"),
    )
