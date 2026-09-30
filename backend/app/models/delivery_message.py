from sqlalchemy import Column, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from app.core.utc_datetime import UTCDateTime


class DeliveryMessage(Base):
    __tablename__ = "delivery_messages"

    id = Column(Integer, primary_key=True, index=True)

    created_at = Column(UTCDateTime(), server_default=func.now())
    updated_at = Column(UTCDateTime(), onupdate=func.now())

    translations = relationship("DeliveryMessageTranslation", back_populates="delivery_message", cascade="all, delete-orphan")
