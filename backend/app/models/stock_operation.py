import enum
from sqlalchemy import Column, Integer, Numeric, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class OperationType(str, enum.Enum):
    income               = "income"
    return_from_customer = "return_from_customer"
    sold                 = "sold"
    return_to_supplier   = "return_to_supplier"
    # Пересчёт: продавец назвал фактическое число, разницу посчитал сервер.
    # Единственный тип со знаком: пересчёт и добавляет, и убавляет, а выдумывать
    # «приход» там, где товар нашёлся, и «возврат поставщику» там, где он
    # пропал, — значит писать в журнал неправду о том, что произошло.
    correction           = "correction"


class StockOperation(Base):
    __tablename__ = "stock_operations"

    id              = Column(Integer, primary_key=True, index=True)
    shop_id         = Column(Integer, ForeignKey("shop_bases.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id      = Column(Integer, ForeignKey("products.id",      ondelete="CASCADE"),  nullable=False, index=True)
    measure_unit_id = Column(Integer, ForeignKey("measure_units.id", ondelete="RESTRICT"), nullable=False)
    operation_type  = Column(Enum(OperationType), nullable=False)
    quantity        = Column(Numeric(12, 3), nullable=False)
    # Связь с частью заказа, породившей операцию (для авто-списаний sold).
    # NULL — ручная операция, заведённая через API склада. Даёт трассировку
    # и идемпотентность: одна часть заказа списывается не более одного раза.
    order_shop_id   = Column(Integer, ForeignKey("order_shops.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())

    shop         = relationship("ShopBase")
    product      = relationship("Product")
    measure_unit = relationship("MeasureUnit")
