
from pydantic import Field


from pydantic import BaseModel, field_validator
from datetime import datetime
from app.schemas.common import Code20, LangCode, Name100


class TranslationInput(BaseModel):
    language: LangCode  # "en", "ru", "tk", "tr", etc.
    name: Name100


class MeasureUnitTranslationResponse(BaseModel):
    language: str
    name: str

    class Config:
        from_attributes = True


class MeasureUnitCreate(BaseModel):
    code: Code20
    translations: list[TranslationInput] = Field(..., max_length=10)

    @field_validator("code")
    @classmethod
    def code_lowercase(cls, v: str) -> str:
        if len(v) > 20:
            raise ValueError("Code must be max 20 characters")
        return v.lower()


class MeasureUnitUpdate(BaseModel):
    code: Code20 | None = None
    translations: list[TranslationInput] | None = Field(None, max_length=10)

    @field_validator("code")
    @classmethod
    def code_lowercase(cls, v: str | None) -> str | None:
        if v is None:
            return v
        if len(v) > 20:
            raise ValueError("Code must be max 20 characters")
        return v.lower()


class MeasureUnitResponse(BaseModel):
    id:           int
    code:         str
    translations: list[MeasureUnitTranslationResponse]
    is_active:    bool
    created_at:   datetime
    updated_at:   datetime | None

    class Config:
        from_attributes = True
