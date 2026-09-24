from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import get_current_user, require_permissions
from app.core.ownership import is_staff
from app.core.pagination import limit_param, set_pagination_headers, skip_param
from app.core.permissions import Perm
from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.order_status import OrderStatus, OrderStatusCode
from app.models.product import Product
from app.models.notification import NotificationKind
from app.models.review import Review, ReviewStatus
from app.models.shop_base import ShopBase
from app.models.user import User
from app.services.notifications import notify, notify_shop_owner
from app.schemas.review import (
    ReviewCreateRequest,
    ReviewEligibilityResponse,
    ReviewRejectRequest,
    ReviewResponse,
    ReviewSummaryResponse,
    ReviewUpdateRequest,
)

router = APIRouter()

# Право, по которому отличается модератор отзывов.
STAFF_REVIEWS = (Perm.REVIEWS_MODERATE,)


async def _recalculate_ratings(db: AsyncSession, product_id: int) -> None:
    """
    Пересчитывает рейтинг товара и его магазина из подтверждённых отзывов.

    Считает целиком, а не прибавляет и вычитает по одному отзыву. Инкремент
    быстрее, но любая пропущенная ветка (отклонили ранее подтверждённый,
    поменяли оценку, удалили) навсегда оставляет неверное число, и заметить это
    можно только вручную. Полный пересчёт самоисправляющийся: сколько бы раз он
    ни выполнился и в каком бы порядке, результат один.
    """
    product = await db.get(Product, product_id)
    if product is None:
        return

    stats = await db.execute(
        select(func.count(Review.id), func.avg(Review.rating)).where(
            Review.product_id == product_id, Review.status == ReviewStatus.approved
        )
    )
    count, average = stats.one()
    product.rating_count = count or 0
    product.rating_avg = round(average, 2) if average is not None else None

    shop = await db.get(ShopBase, product.shop_base_id)
    if shop is None:
        return

    shop_stats = await db.execute(
        select(func.count(Review.id), func.avg(Review.rating))
        .join(Product, Product.id == Review.product_id)
        .where(Product.shop_base_id == shop.id, Review.status == ReviewStatus.approved)
    )
    shop_count, shop_average = shop_stats.one()
    shop.rating_count = shop_count or 0
    shop.rating_avg = round(shop_average, 2) if shop_average is not None else None


async def _purchased_item(db: AsyncSession, user_id: int, product_id: int) -> OrderItem | None:
    """
    Находит купленную позицию, которая даёт право на отзыв.

    Условие одно: товар из заказа этого пользователя, и заказ завершён. До
    завершения товар ещё не получен, и оценивать нечего — иначе оценки ставили
    бы за оформление, а не за покупку.
    """
    result = await db.execute(
        select(OrderItem)
        .join(Order, Order.id == OrderItem.order_id)
        .join(OrderStatus, OrderStatus.id == Order.order_status_id)
        .where(
            Order.user_id == user_id,
            OrderItem.product_id == product_id,
            OrderStatus.code == OrderStatusCode.completed,
        )
        .order_by(OrderItem.id.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


def _public(review: Review) -> ReviewResponse:
    """
    Отзыв для публичной выдачи: только имя автора.

    Фамилия и телефон к оценке товара отношения не имеют, а отдавать их значит
    раскрывать, кто что купил, любому посетителю.

    Причина отказа сюда тоже не попадает: это переписка модератора с автором, а
    не часть отзыва. Автору она видна в своих отзывах, модератору — в очереди.
    """
    return ReviewResponse(
        id=review.id,
        product_id=review.product_id,
        rating=review.rating,
        text=review.text,
        status=review.status,
        author={"name": review.user.name if review.user else None},
        created_at=review.created_at,
    )


def _for_moderator(review: Review) -> ReviewResponse:
    """
    Отзыв в очереди проверки.

    То же, что публично, плюс причина отказа: без неё модератор не видит, что
    сам же написал по этому отзыву, и решение приходится вспоминать.
    """
    return ReviewResponse(
        **_public(review).model_dump(exclude={"moderation_comment"}),
        moderation_comment=review.moderation_comment,
    )


@router.get("/product/{product_id}", response_model=list[ReviewResponse])
async def list_product_reviews(
    product_id: int,
    response: Response,
    skip: int = skip_param(),
    limit: int = limit_param(),
    db: AsyncSession = Depends(get_db),
):
    """Подтверждённые отзывы о товаре. Метод публичный: отзывы для покупателей."""
    conditions = [Review.product_id == product_id, Review.status == ReviewStatus.approved]

    total = await db.execute(select(func.count(Review.id)).where(*conditions))
    set_pagination_headers(response, total=total.scalar() or 0, skip=skip, limit=limit)

    result = await db.execute(
        select(Review)
        .options(selectinload(Review.user))
        .where(*conditions)
        .order_by(Review.id.desc())
        .offset(skip)
        .limit(limit)
    )
    return [_public(review) for review in result.scalars().all()]


@router.get("/product/{product_id}/summary", response_model=ReviewSummaryResponse)
async def product_review_summary(product_id: int, db: AsyncSession = Depends(get_db)):
    """
    Сводка по товару: средняя оценка, количество и разбивка по звёздам.

    Средняя и количество берутся из товара — они уже пересчитаны и совпадают с
    тем, что показано в каталоге. Разбивка считается запросом: она нужна только
    на карточке товара, и хранить её незачем.
    """
    product = await db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    rows = await db.execute(
        select(Review.rating, func.count(Review.id))
        .where(Review.product_id == product_id, Review.status == ReviewStatus.approved)
        .group_by(Review.rating)
    )
    breakdown = {rating: count for rating, count in rows.all()}

    return ReviewSummaryResponse(
        product_id=product_id,
        rating_avg=product.rating_avg,
        rating_count=product.rating_count or 0,
        breakdown={star: breakdown.get(star, 0) for star in range(1, 6)},
    )


@router.get("/product/{product_id}/eligibility", response_model=ReviewEligibilityResponse)
async def review_eligibility(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Можно ли оставить отзыв на этот товар.

    Отдельный метод, потому что форму надо показать или не показать до того, как
    человек начнёт писать: получить отказ после набранного текста — худший из
    возможных вариантов.
    """
    existing = await db.execute(
        select(Review).where(Review.user_id == current_user.id, Review.product_id == product_id)
    )
    review = existing.scalar_one_or_none()
    if review is not None:
        return ReviewEligibilityResponse(
            can_review=False, existing_review_id=review.id, reason="already_reviewed"
        )

    if await _purchased_item(db, current_user.id, product_id) is None:
        return ReviewEligibilityResponse(can_review=False, reason="not_purchased")

    return ReviewEligibilityResponse(can_review=True)


@router.get("/my", response_model=list[ReviewResponse])
async def list_own_reviews(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Свои отзывы в любом состоянии.

    Автор должен видеть и непроверенные, и отклонённые вместе с причиной: иначе
    отзыв после отправки просто пропадает, и непонятно, дошёл ли он.
    """
    result = await db.execute(
        select(Review).where(Review.user_id == current_user.id).order_by(Review.id.desc())
    )
    return result.scalars().all()


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    payload: ReviewCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.REVIEWS_CREATE)),
):
    """
    Оставить отзыв о купленном товаре.

    Купленном и полученном: нужна позиция из завершённого заказа. Отзыв уходит
    на проверку — витрина публична, и пропускать туда что угодно нельзя.
    """
    product = await db.get(Product, payload.product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    duplicate = await db.execute(
        select(Review.id).where(
            Review.user_id == current_user.id, Review.product_id == payload.product_id
        )
    )
    if duplicate.scalar_one_or_none() is not None:
        raise HTTPException(status_code=400, detail="You have already reviewed this product")

    order_item = await _purchased_item(db, current_user.id, payload.product_id)
    if order_item is None:
        raise HTTPException(
            status_code=403,
            detail="You can review only products from your completed orders",
        )

    review = Review(
        user_id=current_user.id,
        product_id=payload.product_id,
        order_item_id=order_item.id,
        rating=payload.rating,
        text=payload.text or None,
        status=ReviewStatus.pending,
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)
    return review


@router.put("/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: int,
    payload: ReviewUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Правка своего отзыва.

    Правка возвращает отзыв на проверку: иначе подтверждённый безобидный текст
    можно было бы заменить на любой другой, минуя модерацию. Рейтинг товара при
    этом пересчитывается — отзыв перестаёт быть подтверждённым и выходит из
    среднего.
    """
    review = await db.get(Review, review_id)
    if review is None or review.user_id != current_user.id:
        # 404 и для чужого: подтверждать существование чужого отзыва незачем.
        raise HTTPException(status_code=404, detail="Review not found")

    data = payload.model_dump(exclude_unset=True)
    if not data:
        return review

    for field, value in data.items():
        setattr(review, field, value)
    review.status = ReviewStatus.pending
    review.moderation_comment = None

    # Без flush пересчёт считает по старому состоянию: смена статуса ещё не
    # дошла до базы, и отзыв остаётся в средней оценке, хотя с витрины уже ушёл.
    await db.flush()
    await _recalculate_ratings(db, review.product_id)
    await db.commit()
    await db.refresh(review)
    return review


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Удалить свой отзыв. Сотрудник платформы может удалить любой."""
    review = await db.get(Review, review_id)
    if review is None:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != current_user.id and not is_staff(current_user, *STAFF_REVIEWS):
        raise HTTPException(status_code=404, detail="Review not found")

    product_id = review.product_id
    await db.delete(review)
    await db.flush()
    await _recalculate_ratings(db, product_id)
    await db.commit()
    return None


# ── Модерация ────────────────────────────────────────────────────────────────


@router.get("/moderation", response_model=list[ReviewResponse])
async def moderation_queue(
    response: Response,
    skip: int = skip_param(),
    limit: int = limit_param(),
    review_status: ReviewStatus = ReviewStatus.pending,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.REVIEWS_MODERATE)),
):
    """
    Очередь проверки. По умолчанию — непроверенные.

    Пагинация через общие limit_param/skip_param, а не своим Query: свой предел
    в 100 расходился с остальными списками (общий максимум — 500), и админка,
    запрашивающая 500, получала 422 на пустой странице.
    """
    total = await db.execute(select(func.count(Review.id)).where(Review.status == review_status))
    set_pagination_headers(response, total=total.scalar() or 0, skip=skip, limit=limit)

    result = await db.execute(
        select(Review)
        .options(selectinload(Review.user))
        .where(Review.status == review_status)
        .order_by(Review.id)
        .offset(skip)
        .limit(limit)
    )
    return [_for_moderator(review) for review in result.scalars().all()]


@router.get("/moderation/count")
async def moderation_count(
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.REVIEWS_MODERATE)),
):
    """Сколько отзывов ждёт проверки — для отметки в меню админки."""
    total = await db.execute(
        select(func.count(Review.id)).where(Review.status == ReviewStatus.pending)
    )
    return {"count": total.scalar() or 0}


@router.patch("/{review_id}/approve", response_model=ReviewResponse)
async def approve_review(
    review_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.REVIEWS_MODERATE)),
):
    """Пропустить отзыв на витрину: с этого момента он входит в рейтинг."""
    review = await db.get(Review, review_id)
    if review is None:
        raise HTTPException(status_code=404, detail="Review not found")

    review.status = ReviewStatus.approved
    review.moderation_comment = None
    await db.flush()
    await _recalculate_ratings(db, review.product_id)
    # Отзыв уходит на проверку и до её конца не виден: без уведомления автор не
    # знает, опубликовали его или нет.
    await notify(
        db,
        user_id=review.user_id,
        kind=NotificationKind.review_approved,
        entity_id=review.id,
    )
    # И владельцу магазина: отзыв меняет его рейтинг, а узнавал он об этом,
    # только открыв карточку товара и заметив, что оценка сдвинулась.
    product = await db.get(Product, review.product_id)
    if product is not None:
        await notify_shop_owner(
            db,
            shop_base_id=product.shop_base_id,
            kind=NotificationKind.review_received,
            entity_id=review.id,
            comment=str(review.rating),
        )
    await db.commit()
    await db.refresh(review)
    return review


@router.patch("/{review_id}/reject", response_model=ReviewResponse)
async def reject_review(
    review_id: int,
    payload: ReviewRejectRequest,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.REVIEWS_MODERATE)),
):
    """
    Отклонить отзыв с причиной.

    Причина обязательна и видна автору: без неё отзыв просто исчезает, и
    исправить его нельзя, потому что непонятно что.
    """
    review = await db.get(Review, review_id)
    if review is None:
        raise HTTPException(status_code=404, detail="Review not found")

    review.status = ReviewStatus.rejected
    review.moderation_comment = payload.moderation_comment
    await notify(
        db,
        user_id=review.user_id,
        kind=NotificationKind.review_rejected,
        entity_id=review.id,
        comment=review.moderation_comment,
    )
    await db.flush()
    # Пересчёт нужен и здесь: отклонить могли ранее подтверждённый отзыв, и он
    # обязан выйти из среднего.
    await _recalculate_ratings(db, review.product_id)
    await db.commit()
    await db.refresh(review)
    return review
