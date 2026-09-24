from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Category(Base):
    __tablename__ = "categories"

    id         = Column(Integer, primary_key=True, index=True)
    parent_id  = Column(Integer, ForeignKey("categories.id"), nullable=True)
    image_path = Column(String(255), nullable=True)
    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    parent       = relationship("Category", remote_side="Category.id", back_populates="children")
    children     = relationship("Category", back_populates="parent")
    translations = relationship("CategoryTranslation", back_populates="category", cascade="all, delete-orphan")