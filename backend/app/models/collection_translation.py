from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class CollectionTranslation(Base):
    __tablename__ = "collection_translations"

    id            = Column(Integer, primary_key=True, index=True)
    collection_id = Column(Integer, ForeignKey("collections.id", ondelete="CASCADE"), nullable=False)
    language      = Column(String(10), nullable=False)
    name          = Column(String(255), nullable=False)

    collection = relationship("Collection", back_populates="translations")

    __table_args__ = (
        UniqueConstraint("collection_id", "language", name="uq_collection_language"),
    )
