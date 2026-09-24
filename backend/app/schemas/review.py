from datetime import datetime
from decimal import Decimal
from typing import Annotated, Optional

from pydantic import BaseModel, Field

from app.models.review import ReviewStatus
from app.schemas.common import Comment1000

Rating = Annotated[int, Field(ge=1, le=5)]


class ReviewCreateRequest(BaseModel):
    product_id: int
    rating: Rating
    # Текст необязателен: оценка сама по себе — уже отзыв, и требовать слова
    # значит терять оценки от тех, кому нечего добавить.
    text: Optional[Comment1000] = None


class ReviewUpdateRequest(BaseModel):
    rating: Optional[Rating] = None
    text: Optional[Comment1000] = None


class ReviewRejectRequest(BaseModel):
    # Причина обязательна: без неё отзыв просто исчезает, и автор не понимает,
    # что исправить.
    moderation_comment: Comment1000


class ReviewAuthor(BaseModel):
    """Автор отзыва так, как его показывают публично: имя без фамилии и связи."""

    name: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    product_id: int
    rating: int
    text: Optional[str] = None
    status: ReviewStatus
    moderation_comment: Optional[str] = None
    author: Optional[ReviewAuthor] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ReviewSummaryResponse(BaseModel):
    """Сводка по товару: сколько оценок и какие."""

    product_id: int
    rating_avg: Optional[Decimal] = None
    rating_count: int = 0
    # Разбивка по звёздам: ключ — оценка, значение — сколько таких. Нужна для
    # обычной гистограммы под товаром; без неё средняя оценка ничего не говорит
    # о разбросе.
    breakdown: dict[int, int] = {}


class ReviewEligibilityResponse(BaseModel):
    """
    Можно ли оставить отзыв на товар и почему нет.

    Причина нужна на экране: «нельзя» без объяснения читается как поломка, а
    правило здесь неочевидное — товар должен быть куплен в завершённом заказе.
    """

    can_review: bool
    # Отзыв уже есть — его показывают вместо формы, вместе со статусом проверки.
    existing_review_id: Optional[int] = None
    reason: Optional[str] = None
