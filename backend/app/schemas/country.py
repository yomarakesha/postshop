
from pydantic import Field


from pydantic import BaseModel, field_validator
from datetime import datetime
from app.schemas.common import IsoCode3, LangCode, Name100


class TranslationInput(BaseModel):
    language: LangCode  # "en", "ru", "tk", "tr", etc.
    name: Name100


class CountryTranslationResponse(BaseModel):
    language: str
    name: str

    class Config:
        from_attributes = True


class CountryCreate(BaseModel):
    iso_code: IsoCode3
    translations: list[TranslationInput] = Field(..., max_length=10)

    @field_validator("iso_code")
    @classmethod
    def iso_code_uppercase(cls, v: str) -> str:
        if not v.isalpha() or len(v) > 3:
            raise ValueError("ISO code must be alphabetic and max 3 characters")
        return v.upper()


class CountryUpdate(BaseModel):
    iso_code: IsoCode3 | None = None
    translations: list[TranslationInput] | None = Field(None, max_length=10)

    @field_validator("iso_code")
    @classmethod
    def iso_code_uppercase(cls, v: str | None) -> str | None:
        if v is None:
            return v
        if not v.isalpha() or len(v) > 3:
            raise ValueError("ISO code must be alphabetic and max 3 characters")
        return v.upper()


class CountryResponse(BaseModel):
    id:           int
    iso_code:     str
    translations: list[CountryTranslationResponse]
    is_active:    bool
    created_at:   datetime
    updated_at:   datetime | None

    class Config:
        from_attributes = True
