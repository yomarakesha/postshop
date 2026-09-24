import enum
from sqlalchemy import Column, Integer, Numeric, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class ReceiptStatus(str, enum.Enum):
    draft     = "draft"
    confirmed = "confirmed"
    # Ошибочный черновик прихода некуда было девать: удаления нет, статусов
    # было два. Отмена оставляет запись в истории, но убирает её из работы.
    cancelled = "cancelled"


class StockReceipt(Base):
    __tablename__ = "stock_receipts"

    id           = Column(Integer, primary_key=True, index=True)
    shop_id      = Column(Integer, ForeignKey("shop_bases.id",  ondelete="CASCADE"), nullable=False, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id",  ondelete="RESTRICT"), nullable=False, index=True)
    status       = Column(Enum(ReceiptStatus), nullable=False, default=ReceiptStatus.draft)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    confirmed_at = Column(DateTime(timezone=True), nullable=True)

    shop      = relationship("ShopBase")
    warehouse = relationship("Warehouse")
    items     = relationship("StockReceiptItem", back_populates="receipt", cascade="all, delete-orphan")


class StockReceiptItem(Base):
    __tablename__ = "stock_receipt_items"

    id              = Column(Integer, primary_key=True, index=True)
    receipt_id      = Column(Integer, ForeignKey("stock_receipts.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id      = Column(Integer, ForeignKey("products.id",       ondelete="CASCADE"), nullable=False)
    measure_unit_id = Column(Integer, ForeignKey("measure_units.id",  ondelete="RESTRICT"), nullable=False)
    quantity        = Column(Numeric(12, 3), nullable=False)

    receipt      = relationship("StockReceipt", back_populates="items")
    product      = relationship("Product")
    measure_unit = relationship("MeasureUnit")
