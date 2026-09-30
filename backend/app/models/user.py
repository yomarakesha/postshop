from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from app.core.utc_datetime import UTCDateTime


class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(100), nullable=True)
    surname    = Column(String(100), nullable=True)
    username   = Column(String(50), unique=True, index=True, nullable=True)
    email      = Column(String(100), unique=True, index=True, nullable=True)
    phone      = Column(String(20), unique=True, index=True, nullable=True)
    password   = Column(String(255), nullable=True)
    is_active  = Column(Boolean, default=True)
    client     = Column(Boolean, nullable=True, default=False)
    created_at = Column(UTCDateTime(), server_default=func.now())
    updated_at = Column(UTCDateTime(), onupdate=func.now())

    permissions = relationship(
        "Permission",
        secondary="user_permissions",
        primaryjoin="User.id == foreign(UserPermission.user_id)",
        secondaryjoin="UserPermission.permission_id == foreign(Permission.id)",
        lazy="selectin",
        viewonly=True,
    )