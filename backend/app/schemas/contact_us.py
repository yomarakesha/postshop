from pydantic import BaseModel
from datetime import datetime
from app.schemas.common import Message2000, Name255, Phone50


class ContactUsCreate(BaseModel):
    name:    Name255
    phone:   Phone50
    message: Message2000


class ContactUsHandledUpdate(BaseModel):
    is_handled: bool


class ContactUsResponse(BaseModel):
    id:         int
    name:       str
    phone:      str
    message:    str
    is_handled: bool
    handled_at: datetime | None
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True
