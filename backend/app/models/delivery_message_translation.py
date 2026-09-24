from sqlalchemy import Column, Integer, Text, ForeignKey, UniqueConstraint, String
from sqlalchemy.orm import relationship
from app.database import Base


class DeliveryMessageTranslation(Base):
    __tablename__ = "delivery_message_translations"

    id                  = Column(Integer, primary_key=True, index=True)
    delivery_message_id = Column(Integer, ForeignKey("delivery_messages.id", ondelete="CASCADE"), nullable=False)
    language            = Column(String(10), nullable=False)
    text                = Column(Text, nullable=False)

    delivery_message = relationship("DeliveryMessage", back_populates="translations")

    __table_args__ = (
        UniqueConstraint("delivery_message_id", "language", name="uq_delivery_message_language"),
    )
