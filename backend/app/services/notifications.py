"""
Отправка уведомлений.

Одна функция на весь проект: уведомления рождаются в шести разных роутерах, и
без общего места каждый писал бы свою вставку — с разными полями и своим
представлением о том, что считать прочитанным.
"""

from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification, NotificationKind
from app.models.shop_base import ShopBase


async def notify(
    db: AsyncSession,
    *,
    user_id: int | None,
    kind: NotificationKind,
    entity_id: int | None = None,
    comment: str | None = None,
    shop_base_id: int | None = None,
) -> None:
    """
    Добавляет уведомление в текущую транзакцию.

    Commit не делает: уведомление должно появиться ровно тогда, когда произошло
    само событие. Отдельная транзакция означала бы, что о неслучившемся
    отклонении товара человек всё равно узнал — или наоборот.

    `user_id` может быть None (владелец объекта не найден) — тогда уведомлять
    некого и функция просто ничего не делает. Падать здесь нельзя: уведомление
    вторично по отношению к действию, ради которого его отправляют.
    """
    if user_id is None:
        return

    db.add(
        Notification(
            user_id=user_id,
            kind=kind,
            entity_id=entity_id,
            comment=comment,
            shop_base_id=shop_base_id,
        )
    )


async def notify_shop_owner(
    db: AsyncSession,
    *,
    shop_base_id: int,
    kind: NotificationKind,
    entity_id: int | None = None,
    comment: str | None = None,
) -> None:
    """
    Уведомляет владельца магазина.

    Отдельная функция, потому что искать владельца по магазину приходится в
    пяти роутерах, и каждый писал бы свой запрос. Магазина может не быть
    (удалён) — тогда уведомлять некого, и это не ошибка: уведомление вторично
    по отношению к действию, ради которого его отправляют.
    """
    owner_id = (await db.execute(
        select(ShopBase.owner_id).where(ShopBase.id == shop_base_id)
    )).scalar_one_or_none()
    # Магазин запоминается в самом уведомлении: витрина ведёт сразу в его
    # кабинет, а не на выбор из девяти.
    await notify(
        db,
        user_id=owner_id,
        kind=kind,
        entity_id=entity_id,
        comment=comment,
        shop_base_id=shop_base_id,
    )


async def purge_old_notifications(db: AsyncSession, *, older_than_days: int) -> int:
    """
    Удаляет уведомления старше указанного срока. Возвращает число удалённых.

    Уведомления — единственная растущая таблица, которую ничто не удерживает:
    внешних ключей на неё нет, из интерфейса их не убирали, и за год активной
    работы на каждого покупателя копились сотни строк о событиях, которые он
    давно забыл. Прочитанные и непрочитанные чистятся одинаково: уведомление
    трёхмесячной давности не прочитают уже никогда, а держать его вечно ради
    красного кружочка на колокольчике смысла нет.

    Ноль и отрицательные значения срока отключают уборку — так настройка
    выключается без правки кода.
    """
    if older_than_days <= 0:
        return 0

    cutoff = datetime.now(timezone.utc) - timedelta(days=older_than_days)
    result = await db.execute(
        delete(Notification).where(Notification.created_at < cutoff)
    )
    await db.commit()
    return result.rowcount or 0
