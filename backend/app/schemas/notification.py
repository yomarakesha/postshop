from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.notification import NotificationKind


class NotificationResponse(BaseModel):
    id: int
    kind: NotificationKind
    entity_id: Optional[int] = None
    # Магазин события продавца: витрина ведёт прямо в его кабинет.
    shop_base_id: Optional[int] = None
    comment: Optional[str] = None
    is_read: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UnreadCountResponse(BaseModel):
    count: int
