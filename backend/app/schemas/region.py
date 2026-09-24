
from pydantic import Field


from pydantic import BaseModel
from datetime import datetime
from app.schemas.common import LangCode, Name100


class TranslationInput(BaseModel):
    language: LangCode  # "en", "ru", "tk", "tr", etc.
    name: Name100


class RegionTranslationResponse(BaseModel):
    language: str
    name: str

    class Config:
        from_attributes = True


class CountryTranslationResponse(BaseModel):
    language: str
    name: str

    class Config:
        from_attributes = True


class CountryShort(BaseModel):
    id:           int
    iso_code:     str
    translations: list[CountryTranslationResponse]

    class Config:
        from_attributes = True


class RegionCreate(BaseModel):
    translations: list[TranslationInput] = Field(..., max_length=10)
    country_id:   int


class RegionUpdate(BaseModel):
    translations: list[TranslationInput] | None = Field(None, max_length=10)
    country_id:   int | None = None


class RegionResponse(BaseModel):
    id:           int
    translations: list[RegionTranslationResponse]
    country_id:   int
    country:      CountryShort
    is_active:    bool
    created_at:   datetime
    updated_at:   datetime | None

    class Config:
        from_attributes = True
