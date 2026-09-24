from sqlalchemy import Boolean, Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.database import Base


class ContactUs(Base):
    __tablename__ = "contact_us"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(255), nullable=False)
    phone      = Column(String(50), nullable=False)
    message    = Column(Text, nullable=False)
    # Обращения можно было только читать, поэтому оператор перечитывал одни
    # и те же: отметки «обработано» не существовало.
    is_handled = Column(Boolean, nullable=False, default=False, server_default="0")
    handled_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
