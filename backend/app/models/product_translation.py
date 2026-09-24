from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint, Text
from sqlalchemy.orm import relationship
from app.database import Base


class ProductTranslation(Base):
    __tablename__ = "product_translations"

    id         = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    language   = Column(String(10), nullable=False)  # "en", "ru", "tk", "tr", etc.
    name       = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)

    product = relationship("Product", back_populates="translations")

    __table_args__ = (
        UniqueConstraint("product_id", "language", name="uq_product_language"),
    )
