from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class BannerImage(Base):
    __tablename__ = "banner_images"

    id         = Column(Integer, primary_key=True, index=True)
    banner_id  = Column(Integer, ForeignKey("banners.id", ondelete="CASCADE"), nullable=False)
    language   = Column(String(10), nullable=False)  # "en", "ru", "tk", "tr", etc.
    image_path = Column(String(255), nullable=True)

    banner = relationship("Banner", back_populates="images")

    __table_args__ = (
        UniqueConstraint("banner_id", "language", name="uq_banner_language"),
    )
