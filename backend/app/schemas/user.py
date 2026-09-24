from pydantic import BaseModel, model_validator, Field
from typing import Optional, List
from datetime import datetime
from app.schemas.common import Email100, Name100, Password255, Phone20, Username50


class PermissionResponse(BaseModel):
    id: int
    code: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class UserPermissionGrantResponse(BaseModel):
    """Право пользователя вместе с тем, кто и когда его выдал.

    granted_by и granted_at писались, но не читались нигде: аудит выдачи прав
    был недостижим. Регистрация по SMS и первичное заполнение прав выдают
    права от лица системы, поэтому там granted_by пуст — это не пропуск, а
    признак системной выдачи.
    """
    id: int
    code: str
    description: Optional[str] = None
    granted_at: Optional[datetime] = None
    granted_by: Optional[int] = None
    granted_by_username: Optional[str] = None


class UserCreateRequest(BaseModel):
    # Создавая пользователя, администратор всегда получал client=false и не мог
    # это изменить: поля не было в запросе.
    client: bool = False
    name: Optional[Name100] = None
    surname: Optional[Name100] = None
    username: Optional[Username50] = None
    email: Optional[Email100] = None
    phone: Optional[Phone20] = None
    password: Optional[Password255] = None

    @model_validator(mode="after")
    def check_identifier(self):
        if not any([self.username, self.email, self.phone]):
            raise ValueError("At least one of username, email, or phone must be provided")
        return self


class UserUpdateRequest(BaseModel):
    name: Optional[Name100] = None
    surname: Optional[Name100] = None
    username: Optional[Username50] = None
    email: Optional[Email100] = None
    phone: Optional[Phone20] = None
    password: Optional[Password255] = None


class UserDetailResponse(BaseModel):
    id: int
    name: Optional[str] = None
    surname: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool
    # Признак «зарегистрировался сам по SMS» не попадал ни в одну выдачу,
    # поэтому в админке было не отличить покупателя от сотрудника платформы.
    client: Optional[bool] = None
    created_at: datetime
    permissions: List[PermissionResponse] = []

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    id: int
    name: Optional[str] = None
    surname: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool
    # Признак «зарегистрировался сам по SMS» не попадал ни в одну выдачу,
    # поэтому в админке было не отличить покупателя от сотрудника платформы.
    client: Optional[bool] = None
    created_at: datetime

    class Config:
        from_attributes = True


class GrantPermissionRequest(BaseModel):
    permission_code: str


class RevokePermissionRequest(BaseModel):
    permission_code: str


class BulkGrantRequest(BaseModel):
    permission_codes: List[str] = Field(..., max_length=200)
