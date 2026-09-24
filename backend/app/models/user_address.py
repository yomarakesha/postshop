from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class UserAddress(Base):
    """
    Сохранённый адрес доставки покупателя.

    Адрес в заказе — свободный текст, который набирался заново при каждом
    оформлении: ни выбрать прежний, ни сохранить новый было нельзя. Поэтому
    адреса живут отдельно от заказов: заказ хранит текст на момент покупки и
    не должен меняться, если человек потом поправит свой адрес.

    Города здесь нет намеренно: заказ город не хранит, и поле, которое ни на
    что не влияет, только выглядело бы значимым.
    """

    __tablename__ = "user_addresses"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    # Название нужно, чтобы список читался: «Дом», «Работа», «Мама».
    title      = Column(String(100), nullable=False)
    address    = Column(Text, nullable=False)
    # Адрес по умолчанию подставляется при оформлении. Он один на пользователя —
    # это поддерживается в роутере, а не ограничением базы: снять флаг у
    # прежнего и поставить новому нельзя одним выражением.
    is_default = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User")
