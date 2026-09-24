from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class CategoryTranslation(Base):
    __tablename__ = "category_translations"

    id          = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    language    = Column(String(10), nullable=False)  # "en", "ru", "tk", "tr", etc.
    name        = Column(String(100), nullable=False)

    category = relationship("Category", back_populates="translations")

    __table_args__ = (
        UniqueConstraint("category_id", "language", name="uq_category_language"),
    )
