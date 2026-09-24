from pydantic import BaseModel
from typing import Optional, List
from app.schemas.shop_base import ShopMeResponse
from app.schemas.common import OtpCode, Password255, Phone20, Token2048, Username50


class LoginRequest(BaseModel):
    username: Username50
    password: Password255


class OTPRequest(BaseModel):
    phone_number: Phone20


class OTPVerifyRequest(BaseModel):
    phone_number: Phone20
    code: OtpCode


class OTPRequestResponse(BaseModel):
    detail: str


class DetailResponse(BaseModel):
    """Ответ метода, которому нечего вернуть кроме факта выполнения."""

    detail: str


class PasswordChangeRequest(BaseModel):
    """
    Смена своего пароля.

    Текущий пароль необязателен только для учётной записи, у которой пароля
    никогда не было (вход по SMS). Во всех остальных случаях он обязателен —
    проверка в методе.
    """

    current_password: Optional[Password255] = None
    new_password: Password255


class PhoneChangeRequest(BaseModel):
    new_phone: Phone20


class PhoneChangeVerifyRequest(BaseModel):
    new_phone: Phone20
    code: OtpCode


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: Token2048


class PermissionResponse(BaseModel):
    id: int
    code: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: int
    name: Optional[str] = None
    surname: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool
    client: Optional[bool] = None
    permissions: List[PermissionResponse] = []
    shops: List[ShopMeResponse] = []

    class Config:
        from_attributes = True


class OTPVerifyResponse(TokenResponse):
    id: int
    name: Optional[str] = None
    surname: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool
    client: Optional[bool] = None
    permissions: List[PermissionResponse] = []

    class Config:
        from_attributes = True
