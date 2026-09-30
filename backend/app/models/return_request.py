import enum

from sqlalchemy import (
    Column,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base
from app.core.utc_datetime import UTCDateTime


class ReturnStatus(str, enum.Enum):
    pending  = "pending"
    approved = "approved"
    rejected = "rejected"


class ReturnRequest(Base):
    """
    Заявка покупателя на возврат купленного товара.

    Возврата не было вовсе: в журнале склада существовал тип операции
    return_from_customer, но завести его было нечем — ни заявки, ни решения по
    ней. Товар физически возвращали, а в системе он оставался проданным.

    Заявка ссылается на строку заказа (order_item_id), а не на товар: возвращают
    конкретную покупку, и количество ограничено тем, сколько в ней было.

    Подтверждение заявки — это утверждение платформы, что товар у неё. Поэтому
    в этот же момент товар возвращается на склад: отдельного «товар приехал» в
    системе нет, и добавлять состояние, которое некому проставить, значило бы
    завести заявки, застревающие навсегда.
    """

    __tablename__ = "return_requests"

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    order_item_id = Column(Integer, ForeignKey("order_items.id", ondelete="CASCADE"), nullable=False, index=True)
    quantity      = Column(Numeric(12, 3), nullable=False)
    # Причина обязательна: без неё решение принимать не по чему.
    reason        = Column(Text, nullable=False)
    status        = Column(Enum(ReturnStatus), nullable=False, default=ReturnStatus.pending, index=True)
    # Ответ платформы. Обязателен при отказе — иначе заявка просто закрывается,
    # и покупатель не знает почему.
    resolution_comment = Column(Text, nullable=True)
    created_at    = Column(UTCDateTime(), server_default=func.now())
    updated_at    = Column(UTCDateTime(), onupdate=func.now())

    user       = relationship("User")
    order_item = relationship("OrderItem")
