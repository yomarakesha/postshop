
from pydantic import StringConstraints


from pydantic import BaseModel
from datetime import datetime
from app.schemas.common import Name100


class BrandCreate(BaseModel):
    name: Name100


class BrandUpdate(BaseModel):
    name: Name100


class BrandResponse(BaseModel):
    id: int
    name: str
    image_path: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True