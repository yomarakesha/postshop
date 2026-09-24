
from pydantic import Field


from pydantic import BaseModel
from datetime import datetime
from app.schemas.common import LangCode, Name100


class TranslationInput(BaseModel):
    language: LangCode  # "en", "ru", "tk", "tr", etc.
    name: Name100


class CategoryTranslationResponse(BaseModel):
    language: str
    name: str

    class Config:
        from_attributes = True


class CategoryCreate(BaseModel):
    translations: list[TranslationInput] = Field(..., max_length=10)
    parent_id: int | None = None


class CategoryUpdate(BaseModel):
    translations: list[TranslationInput] | None = Field(None, max_length=10)
    parent_id: int | None = None


class CategoryShort(BaseModel):
    id: int
    translations: list[CategoryTranslationResponse]
    image_path: str | None = None
    is_active: bool

    class Config:
        from_attributes = True


class CategoryResponse(BaseModel):
    id: int
    translations: list[CategoryTranslationResponse]
    parent_id: int | None
    parent: CategoryShort | None
    children: list[CategoryShort]
    image_path: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True
