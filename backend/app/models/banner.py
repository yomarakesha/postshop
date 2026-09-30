import enum

from sqlalchemy import Column, Integer, String, Boolean, Date, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from app.core.utc_datetime import UTCDateTime


class BannerPosition(str, enum.Enum):
    """Место на странице, куда встаёт баннер.

    Раньше это была свободная строка: значение сохранялось, но нигде не
    читалось, и в поле попадал любой текст. Порядок объявления задаёт порядок
    показа — по нему сортируется выдача.
    """

    home_top = "home_top"
    home_middle = "home_middle"
    home_bottom = "home_bottom"


# Порядок показа: сверху вниз по странице.
BANNER_POSITION_ORDER = {p.value: i for i, p in enumerate(BannerPosition)}


class Banner(Base):
    __tablename__ = "banners"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(255), nullable=False)
    position   = Column(String(100), nullable=False)
    link       = Column(String(500), nullable=True)
    is_active  = Column(Boolean, default=True)
    priority   = Column(Integer, nullable=False, default=1)
    start_date = Column(Date, nullable=True)
    end_date   = Column(Date, nullable=True)
    created_at = Column(UTCDateTime(), server_default=func.now())
    updated_at = Column(UTCDateTime(), onupdate=func.now())

    images = relationship("BannerImage", back_populates="banner", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("priority >= 1 AND priority <= 5", name="ck_banner_priority"),
    )
