import enum

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class NotificationKind(str, enum.Enum):
    """
    О чём уведомление.

    Хранится вид, а не готовый текст: витрина работает на четырёх языках, и
    текст, записанный в базу, был бы всегда на одном из них — том, что был
    выбран в момент события, а не тем, на котором человек читает.
    """

    product_approved   = "product_approved"
    product_declined   = "product_declined"
    shop_approved      = "shop_approved"
    shop_rejected      = "shop_rejected"
    order_status       = "order_status"
    review_approved    = "review_approved"
    review_rejected    = "review_rejected"
    return_approved    = "return_approved"
    return_rejected    = "return_rejected"

    # События магазина. Их не было вовсе: продавец узнавал о новом заказе,
    # только зайдя и обновив список, а о подтверждённой приёмке — никак.
    order_created      = "order_created"
    order_cancelled    = "order_cancelled"
    receipt_confirmed  = "receipt_confirmed"
    review_received    = "review_received"
    return_received    = "return_received"
    shop_blocked       = "shop_blocked"

    # Товар закончился: остаток дошёл до нуля. Продавец узнавал об этом только
    # от покупателя, который уже не смог его купить, — товар при этом
    # оставался в каталоге.
    product_out_of_stock = "product_out_of_stock"

    # Магазин отказался от своей части заказа. Отдельно от order_status:
    # общий статус заказа при этом не меняется (остальные магазины везут
    # своё), и сообщение «статус заказа изменился» было бы неправдой.
    order_shop_rejected = "order_shop_rejected"


class Notification(Base):
    """
    Уведомление пользователю о событии, которого он не видит сам.

    Раньше не было ничего: товар отклоняли, заявку на магазин отклоняли, статус
    заказа менялся — и узнать об этом можно было только зайдя и проверив
    вручную. Причина отказа существовала в базе, но до человека не доходила.

    Ссылка на объект — просто число (entity_id) без внешнего ключа: виды
    уведомлений указывают на разные таблицы, и один столбец с ключом на все
    сразу невозможен. Удаление объекта оставляет уведомление о прошедшем
    событии — это запись истории, она и должна переживать объект.
    """

    __tablename__ = "notifications"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    kind       = Column(Enum(NotificationKind), nullable=False)
    entity_id  = Column(Integer, nullable=True)
    # Магазин, к которому относится событие продавца.
    #
    # Без него уведомление вело в кабинет «вообще»: маршруты кабинета начинаются
    # с идентификатора магазина, а у продавца их бывает несколько, и витрине
    # приходилось вести на выбор магазина — то есть человек искал руками то, про
    # что ему только что написали. У событий покупателя остаётся пустым.
    shop_base_id = Column(Integer, nullable=True)
    # Текст модератора или новый статус заказа — то, что нельзя вывести из вида.
    comment    = Column(Text, nullable=True)
    is_read    = Column(Boolean, nullable=False, default=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
