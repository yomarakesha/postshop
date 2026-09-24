from pydantic import BaseModel, Field
from datetime import date, datetime

from app.models.banner import BannerPosition
from app.schemas.common import Link500, Name255


class BannerImageResponse(BaseModel):
    language: str
    image_path: str | None = None

    class Config:
        from_attributes = True


class BannerCreate(BaseModel):
    name: Name255
    position: BannerPosition
    link: Link500 | None = None
    is_active: bool = True
    priority: int = Field(default=1, ge=1, le=5)
    start_date: date | None = None
    end_date: date | None = None


class BannerUpdate(BaseModel):
    # is_active сюда не входит осознанно: у флага было два писателя, и PUT
    # ставил его напрямую, минуя проверки «уже заблокирован» и «уже активен»
    # у block/unblock. Состояние меняется только этими двумя методами.
    name: Name255 | None = None
    position: BannerPosition | None = None
    link: Link500 | None = None
    priority: int | None = Field(default=None, ge=1, le=5)
    start_date: date | None = None
    end_date: date | None = None


class BannerResponse(BaseModel):
    id: int
    name: str
    position: BannerPosition
    link: str | None
    is_active: bool
    priority: int
    start_date: date | None
    end_date: date | None
    images: list[BannerImageResponse]
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True
