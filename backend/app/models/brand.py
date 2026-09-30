from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.sql import func
from app.database import Base
from app.core.utc_datetime import UTCDateTime


class Brand(Base):
    __tablename__ = "brands"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(100), unique=True, nullable=False, index=True)
    image_path = Column(String(255), nullable=True)
    is_active  = Column(Boolean, default=True)
    created_at = Column(UTCDateTime(), server_default=func.now())
    updated_at = Column(UTCDateTime(), onupdate=func.now())