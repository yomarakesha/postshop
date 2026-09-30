from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.sql import func
from app.database import Base
from app.core.utc_datetime import UTCDateTime


class PhoneOTP(Base):
    __tablename__ = "phone_otps"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(20), nullable=False, index=True)
    code_hash = Column(String(255), nullable=False)
    expires_at = Column(UTCDateTime(), nullable=False)
    attempts = Column(Integer, default=0, nullable=False)
    max_attempts = Column(Integer, default=5, nullable=False)
    is_used = Column(Boolean, default=False, nullable=False)
    created_at = Column(UTCDateTime(), server_default=func.now())
