import enum

from sqlalchemy import (
    CheckConstraint,
    Column,
    Enum,
    ForeignKey,
    Integer,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base
from app.core.utc_datetime import UTCDateTime


class ReviewStatus(str, enum.Enum):
    pending  = "pending"
    approved = "approved"
    rejected = "rejected"


class Review(Base):
    """
    Отзыв покупателя о товаре.

    Оставить его можно только на купленный товар из завершённого заказа —
    поэтому здесь есть order_item_id: это и доказательство покупки, и ссылка на
    то, какая именно покупка отзыв оправдывает. Без такой привязки оценки
    ставил бы кто угодно кому угодно, и рейтинг ничего не значил бы.

    Один отзыв на товар от одного человека: купив тот же товар второй раз,
    второго голоса не получают — иначе рейтинг накручивался бы повторными
    покупками.

    Магазин здесь не хранится: он берётся через товар. У товара магазин не
    меняется, но дублировать его всё равно значило бы держать два источника
    правды об одном.
    """

    __tablename__ = "reviews"
    __table_args__ = (
        UniqueConstraint("user_id", "product_id", name="uq_review_user_product"),
        CheckConstraint("rating BETWEEN 1 AND 5", name="ck_review_rating_range"),
    )

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id    = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    order_item_id = Column(Integer, ForeignKey("order_items.id", ondelete="CASCADE"), nullable=False)
    rating        = Column(Integer, nullable=False)
    text          = Column(Text, nullable=True)
    # Отзыв виден покупателям только после проверки: витрина — публичное место,
    # и пропускать туда что угодно нельзя.
    status        = Column(Enum(ReviewStatus), nullable=False, default=ReviewStatus.pending, index=True)
    # Почему отклонён — автору это надо сказать, иначе отзыв просто исчезает.
    moderation_comment = Column(Text, nullable=True)
    created_at    = Column(UTCDateTime(), server_default=func.now())
    updated_at    = Column(UTCDateTime(), onupdate=func.now())

    user       = relationship("User")
    product    = relationship("Product")
    order_item = relationship("OrderItem")
