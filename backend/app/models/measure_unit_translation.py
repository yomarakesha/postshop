from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class MeasureUnitTranslation(Base):
    __tablename__ = "measure_unit_translations"

    id              = Column(Integer, primary_key=True, index=True)
    measure_unit_id = Column(Integer, ForeignKey("measure_units.id", ondelete="CASCADE"), nullable=False)
    language        = Column(String(10), nullable=False)  # "en", "ru", "tk", "tr", etc.
    name            = Column(String(100), nullable=False)

    measure_unit = relationship("MeasureUnit", back_populates="translations")

    __table_args__ = (
        UniqueConstraint("measure_unit_id", "language", name="uq_measure_unit_language"),
    )
