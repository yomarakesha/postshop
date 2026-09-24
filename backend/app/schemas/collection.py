
from pydantic import Field


from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from app.schemas.product import ProductResponse
from app.schemas.common import LangCode, Name255


class CollectionTranslationInput(BaseModel):
    language: LangCode
    name: Name255


class CollectionTranslationResponse(BaseModel):
    language: str
    name: str

    class Config:
        from_attributes = True


class CollectionCreate(BaseModel):
    translations: List[CollectionTranslationInput] = Field(..., max_length=10)
    product_ids:  List[int] = Field([], max_length=500)


class CollectionUpdate(BaseModel):
    translations: Optional[List[CollectionTranslationInput]] = Field(None, max_length=10)
    product_ids:  Optional[List[int]] = Field(None, max_length=500)


class CollectionResponse(BaseModel):
    id:           int
    translations: List[CollectionTranslationResponse]
    is_active:    bool
    products:     List[ProductResponse]
    created_at:   datetime
    updated_at:   datetime | None

    class Config:
        from_attributes = True
