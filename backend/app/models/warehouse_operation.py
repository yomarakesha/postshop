import enum
from sqlalchemy import Column, Integer, Numeric, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from app.core.utc_datetime import UTCDateTime


class WarehouseOperationType(str, enum.Enum):
    income               = "income"
    return_from_customer = "return_from_customer"
    sold                 = "sold"
    return_to_shop       = "return_to_shop"
    write_off            = "write_off"


class WarehouseOperation(Base):
    __tablename__ = "warehouse_operations"

    id              = Column(Integer, primary_key=True, index=True)
    warehouse_id    = Column(Integer, ForeignKey("warehouses.id",   ondelete="RESTRICT"), nullable=False, index=True)
    shop_id         = Column(Integer, ForeignKey("shop_bases.id",   ondelete="CASCADE"),  nullable=False, index=True)
    product_id      = Column(Integer, ForeignKey("products.id",     ondelete="CASCADE"),  nullable=False, index=True)
    measure_unit_id = Column(Integer, ForeignKey("measure_units.id", ondelete="RESTRICT"), nullable=False)
    operation_type  = Column(Enum(WarehouseOperationType), nullable=False)
    quantity        = Column(Numeric(12, 3), nullable=False)
    # Часть заказа, по которой списан или возвращён товар; NULL — приёмка и
    # ручные операции. Не даёт списать один заказ дважды.
    order_shop_id   = Column(Integer, ForeignKey("order_shops.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at      = Column(UTCDateTime(), server_default=func.now())

    warehouse    = relationship("Warehouse")
    shop         = relationship("ShopBase")
    product      = relationship("Product")
    measure_unit = relationship("MeasureUnit")
