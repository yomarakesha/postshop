import enum

from sqlalchemy import (
    Boolean,
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

    Одобрение заявки — решение «возврат принимаем», но товар в этот момент ещё
    у покупателя. Раньше одобрение сразу возвращало товар в остаток: его снова
    продавали, пока он ехал назад, а бракованный возвращался в продажу без
    осмотра. Теперь остаток меняется, когда товар получен (received_at): у FBS
    его получает продавец, у FBO — склад Postshop, и получивший решает, можно ли
    продавать его снова (restocked).
    """

    __tablename__ = "return_requests"

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    order_item_id = Column(Integer, ForeignKey("order_items.id", ondelete="CASCADE"), nullable=False, index=True)
    quantity      = Column(Numeric(12, 3), nullable=False)
    # Сумма к возврату: цена на момент заказа × количество. На неё
    # уменьшается выручка магазина в статистике.
    amount        = Column(Numeric(12, 2), nullable=True)
    # Причина обязательна: без неё решение принимать не по чему.
    reason        = Column(Text, nullable=False)
    status        = Column(Enum(ReturnStatus), nullable=False, default=ReturnStatus.pending, index=True)
    # Ответ платформы. Обязателен при отказе — иначе заявка просто закрывается,
    # и покупатель не знает почему.
    resolution_comment = Column(Text, nullable=True)
    # Товар физически получен назад; restocked — вернули в продажу (иначе брак).
    received_at   = Column(UTCDateTime(), nullable=True)
    restocked     = Column(Boolean, nullable=True)
    created_at    = Column(UTCDateTime(), server_default=func.now())
    updated_at    = Column(UTCDateTime(), onupdate=func.now())

    user       = relationship("User")
    order_item = relationship("OrderItem")
