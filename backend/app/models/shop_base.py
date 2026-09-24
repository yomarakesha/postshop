from sqlalchemy import Numeric, Column, Integer, Boolean, DateTime, Enum, JSON, ForeignKey, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class LegalEntityType(str, enum.Enum):
    individual_entrepreneur = "individual_entrepreneur"
    legal_entity = "legal_entity"


class DocumentKind(str, enum.Enum):
    """Какой это документ заявки.

    Раньше документы хранились списком путей вида uploads/documents/20_faf80.pdf,
    и модератор не видел, где паспорт, а где патент, — открывал все подряд.
    Набор совпадает с полями формы «Стать продавцом» на витрине.
    """

    individual_registration = "individual_registration"
    individual_patent = "individual_patent"
    individual_certificate = "individual_certificate"
    individual_passport = "individual_passport"
    legal_charter = "legal_charter"
    legal_extract = "legal_extract"
    legal_certificate = "legal_certificate"
    legal_statistics = "legal_statistics"
    legal_power_of_attorney = "legal_power_of_attorney"


#: Какие документы нужны каждому виду собственника — те же поля, что на витрине.
DOCUMENT_KINDS_BY_ENTITY: dict[LegalEntityType, tuple[DocumentKind, ...]] = {
    LegalEntityType.individual_entrepreneur: (
        DocumentKind.individual_registration,
        DocumentKind.individual_patent,
        DocumentKind.individual_certificate,
        DocumentKind.individual_passport,
    ),
    LegalEntityType.legal_entity: (
        DocumentKind.legal_charter,
        DocumentKind.legal_extract,
        DocumentKind.legal_certificate,
        DocumentKind.legal_statistics,
        DocumentKind.legal_power_of_attorney,
    ),
}


class RegistrationStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    suspended = "suspended"


class ShopBase(Base):
    __tablename__ = "shop_bases"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    legal_entity_type = Column(Enum(LegalEntityType), nullable=False)
    # Список объектов {path, kind, original_name, scan, uploaded_at} —
    # см. app/schemas/shop_base.py::ShopDocument.
    documents = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    registration_status = Column(Enum(RegistrationStatus), default=RegistrationStatus.pending)
    # Причина отказа или замечание модератора. Раньше поля не было вовсе:
    # заявку отклоняли, а владелец не узнавал причину — после подачи наступала
    # тишина. У товара такое поле есть, у магазина не было.
    registration_comment = Column(String(1000), nullable=True)
    # Рейтинг магазина — те же отзывы о его товарах. Считается и хранится так
    # же, как у товара, и по той же причине: магазины отдаются несколькими
    # методами.
    rating_avg   = Column(Numeric(3, 2), nullable=True)
    rating_count = Column(Integer, nullable=False, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner      = relationship("User")
    additional = relationship("ShopAdditional", uselist=False, back_populates="shop_base")
