import enum

from sqlalchemy import Column, Enum, ForeignKey, Integer, Numeric, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.utc_datetime import UTCDateTime
from app.database import Base


class WithdrawalStatus(str, enum.Enum):
    pending   = "pending"
    completed = "completed"
    rejected  = "rejected"
    cancelled = "cancelled"


class WithdrawalRequest(Base):
    """
    Заявка продавца FBO на вывоз своего товара со складов Postshop.

    Товар магазина FBO лежит у платформы, и забрать его продавец не мог никак:
    возврат магазину оформлял только сотрудник, и только если сам знал, что
    продавец этого хочет. Без вывоза магазин к тому же не мог сменить тип
    склада — для этого остаток на складе должен быть нулевым.

    Склад в заявке не указывается: продавцу всё равно, где лежит его товар.
    Сотрудник при выполнении снимает количество со складов по порядку — так же,
    как списывается продажа.
    """

    __tablename__ = "withdrawal_requests"

    id                 = Column(Integer, primary_key=True, index=True)
    shop_id            = Column(Integer, ForeignKey("shop_bases.id", ondelete="CASCADE"), nullable=False, index=True)
    status             = Column(Enum(WithdrawalStatus), nullable=False, default=WithdrawalStatus.pending, index=True)
    # Как и когда продавец заберёт товар — его пожелание сотруднику.
    comment            = Column(Text, nullable=True)
    # Ответ платформы; обязателен при отказе.
    resolution_comment = Column(Text, nullable=True)
    created_at         = Column(UTCDateTime(), server_default=func.now())
    resolved_at        = Column(UTCDateTime(), nullable=True)

    shop  = relationship("ShopBase")
    items = relationship("WithdrawalItem", back_populates="request", cascade="all, delete-orphan")


class WithdrawalItem(Base):
    __tablename__ = "withdrawal_items"

    id              = Column(Integer, primary_key=True, index=True)
    request_id      = Column(Integer, ForeignKey("withdrawal_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id      = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    measure_unit_id = Column(Integer, ForeignKey("measure_units.id", ondelete="RESTRICT"), nullable=False)
    quantity        = Column(Numeric(12, 3), nullable=False)

    request      = relationship("WithdrawalRequest", back_populates="items")
    product      = relationship("Product")
    measure_unit = relationship("MeasureUnit")
