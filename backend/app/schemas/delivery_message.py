from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from app.schemas.common import Description2000, LangCode


class DeliveryMessageTranslationInput(BaseModel):
    language: LangCode
    text: Description2000


class DeliveryMessageTranslationResponse(BaseModel):
    language: str
    text: str

    class Config:
        from_attributes = True


class DeliveryMessageCreate(BaseModel):
    translations: List[DeliveryMessageTranslationInput] = Field(..., max_length=10)


class DeliveryMessageUpdate(BaseModel):
    translations: Optional[List[DeliveryMessageTranslationInput]] = Field(None, max_length=10)


class DeliveryMessageResponse(BaseModel):
    id: int
    translations: List[DeliveryMessageTranslationResponse]
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True
