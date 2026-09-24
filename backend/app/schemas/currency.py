
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from app.schemas.common import Code20, LangCode, Name100


class TranslationInput(BaseModel):
    language: LangCode  # "en", "ru", "tk", "tr", etc.
    name: Name100


class CurrencyTranslationResponse(BaseModel):
    language: str
    name: str

    class Config:
        from_attributes = True


class CurrencyCreate(BaseModel):
    code: Code20
    translations: list[TranslationInput] = Field(..., max_length=10)

    # Код приводится к верхнему регистру: TMT, USD — так по ISO 4217, и так же
    # уже сделано для iso_code страны. Раньше он молча переводился в нижний,
    # поэтому введённый в админке «TMT» превращался в «tmt» без всякого
    # предупреждения, а на витрине цена выводилась как «1745.05 tmt».
    @field_validator("code")
    @classmethod
    def code_uppercase(cls, v: str) -> str:
        if not v.isalpha() or len(v) > 10:
            raise ValueError("Code must be alphabetic and max 10 characters")
        return v.upper()


class CurrencyUpdate(BaseModel):
    code: Code20 | None = None
    translations: list[TranslationInput] | None = Field(None, max_length=10)

    @field_validator("code")
    @classmethod
    def code_uppercase(cls, v: str | None) -> str | None:
        if v is None:
            return v
        if not v.isalpha() or len(v) > 10:
            raise ValueError("Code must be alphabetic and max 10 characters")
        return v.upper()


class CurrencyResponse(BaseModel):
    id:           int
    code:         str
    translations: list[CurrencyTranslationResponse]
    is_active:    bool
    created_at:   datetime
    updated_at:   datetime | None

    class Config:
        from_attributes = True
