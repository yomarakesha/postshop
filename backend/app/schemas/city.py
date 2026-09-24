
from pydantic import Field


from pydantic import BaseModel
from datetime import datetime
from app.schemas.common import LangCode, Name100


class TranslationInput(BaseModel):
    language: LangCode  # "en", "ru", "tk", "tr", etc.
    name: Name100


class CityTranslationResponse(BaseModel):
    language: str
    name: str

    class Config:
        from_attributes = True


class RegionTranslationResponse(BaseModel):
    language: str
    name: str

    class Config:
        from_attributes = True


class RegionShort(BaseModel):
    id:           int
    translations: list[RegionTranslationResponse]

    class Config:
        from_attributes = True


class CityCreate(BaseModel):
    translations: list[TranslationInput] = Field(..., max_length=10)
    region_id: int


class CityUpdate(BaseModel):
    translations: list[TranslationInput] | None = Field(None, max_length=10)
    region_id: int | None = None


class CityResponse(BaseModel):
    id:           int
    translations: list[CityTranslationResponse]
    region_id:    int
    region:       RegionShort
    is_active:    bool
    created_at:   datetime
    updated_at:   datetime | None

    class Config:
        from_attributes = True
