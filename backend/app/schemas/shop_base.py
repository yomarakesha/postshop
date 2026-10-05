from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from app.core.antivirus import ScanStatus
from app.models.shop_base import DocumentKind, LegalEntityType, RegistrationStatus
from app.schemas.shop_additional import ShopAdditionalResponse
from app.schemas.common import Comment1000


class ShopDocument(BaseModel):
    """Документ заявки магазина."""

    #: Путь в хранилище; скачивается через GET /shop-bases/{id}/documents/{filename}.
    path: str
    #: Что за документ. Пусто у загруженных до появления видов.
    kind: Optional[DocumentKind] = None
    #: Имя файла, как его назвал продавец, — только для показа.
    original_name: Optional[str] = None
    #: Проверен ли файл антивирусом.
    scan: ScanStatus = ScanStatus.not_scanned
    uploaded_at: Optional[datetime] = None


class ShopBaseCreate(BaseModel):
    legal_entity_type: LegalEntityType
    documents: List[str] = Field([], max_length=20)


class ShopBaseUpdate(BaseModel):
    legal_entity_type: Optional[LegalEntityType] = None
    documents: Optional[List[str]] = Field(None, max_length=20)


class ShopBaseStatusUpdate(BaseModel):
    # Причина отказа: обязательна при отклонении, иначе владелец не узнаёт,
    # что исправить. Проверка в роутере.
    registration_comment: Optional[Comment1000] = None
    registration_status: RegistrationStatus


class ShopBaseResponse(BaseModel):
    id: int
    owner_id: int
    legal_entity_type: LegalEntityType
    documents: List[ShopDocument]
    is_active: bool
    # Закрыт сотрудником: снять такой блок владелец не может.
    blocked_by_staff: bool = False
    registration_status: RegistrationStatus
    # Причина отказа или замечание модератора: без неё владелец не знает, что
    # исправить, и после подачи заявки наступала тишина.
    registration_comment: Optional[str] = None
    # Рейтинг магазина: те же отзывы о его товарах. Нужен и в карточке магазина,
    # и в списке магазинов, поэтому отдаётся в обеих схемах.
    rating_avg: Optional[Decimal] = None
    rating_count: int = 0
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True


class ShopMeResponse(BaseModel):
    id: int
    registration_status: RegistrationStatus
    registration_comment: Optional[str] = None
    is_active: bool
    # Закрыт сотрудником: снять такой блок владелец не может.
    blocked_by_staff: bool = False
    name: Optional[str] = None
    logo_path: Optional[str] = None

    class Config:
        from_attributes = True


class ShopFullResponse(BaseModel):
    id: int
    owner_id: int
    legal_entity_type: LegalEntityType
    documents: List[ShopDocument]
    is_active: bool
    # Закрыт сотрудником: снять такой блок владелец не может.
    blocked_by_staff: bool = False
    registration_status: RegistrationStatus
    # Рейтинг магазина: те же отзывы о его товарах. Нужен и в карточке магазина,
    # и в списке магазинов, поэтому отдаётся в обеих схемах.
    rating_avg: Optional[Decimal] = None
    rating_count: int = 0
    created_at: datetime
    updated_at: datetime | None
    additional: Optional[ShopAdditionalResponse] = None

    class Config:
        from_attributes = True
