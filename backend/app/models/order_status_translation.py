from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class OrderStatusTranslation(Base):
    __tablename__ = "order_status_translations"

    id              = Column(Integer, primary_key=True, index=True)
    order_status_id = Column(Integer, ForeignKey("order_statuses.id", ondelete="CASCADE"), nullable=False)
    language        = Column(String(10), nullable=False)
    name            = Column(String(100), nullable=False)

    order_status = relationship("OrderStatus", back_populates="translations")

    __table_args__ = (
        UniqueConstraint("order_status_id", "language", name="uq_order_status_language"),
    )
