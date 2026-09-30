from sqlalchemy import Column, Integer, Boolean, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from app.core.utc_datetime import UTCDateTime

# secondary table — managed by SQLAlchemy, no mapped class needed
collection_products = Table(
    "collection_products",
    Base.metadata,
    Column("collection_id", Integer, ForeignKey("collections.id", ondelete="CASCADE"), primary_key=True),
    Column("product_id",    Integer, ForeignKey("products.id",     ondelete="CASCADE"), primary_key=True),
)


class Collection(Base):
    __tablename__ = "collections"

    id         = Column(Integer, primary_key=True, index=True)
    is_active  = Column(Boolean, default=True)
    created_at = Column(UTCDateTime(), server_default=func.now())
    updated_at = Column(UTCDateTime(), onupdate=func.now())

    translations = relationship("CollectionTranslation", back_populates="collection", cascade="all, delete-orphan")
    products     = relationship("Product", secondary=collection_products)
