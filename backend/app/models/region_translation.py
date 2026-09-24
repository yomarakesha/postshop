from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class RegionTranslation(Base):
    __tablename__ = "region_translations"

    id        = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id", ondelete="CASCADE"), nullable=False)
    language  = Column(String(10), nullable=False)  # "en", "ru", "tk", "tr", etc.
    name      = Column(String(100), nullable=False)

    region = relationship("Region", back_populates="translations")

    __table_args__ = (
        UniqueConstraint("region_id", "language", name="uq_region_language"),
    )
