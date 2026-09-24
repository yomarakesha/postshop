"""Метаданные постраничной выдачи.

Списочные эндпоинты возвращали массив и ничего больше: клиент получал 20
записей и не мог отличить «это всё» от «есть ещё». Отсюда молчаливое усечение —
страница показывала первые 20 товаров и выглядела полной.

Форму ответа менять нельзя: тело — массив, и на него уже опирается мобильное
приложение. Поэтому метаданные отдаются заголовками:

    X-Total-Count   сколько записей подходит под фильтры целиком
    X-Skip          смещение текущей страницы
    X-Limit         запрошенный размер страницы
    X-Has-More      есть ли ещё записи за этой страницей ("true"/"false")

Заголовки перечислены в `expose_headers` у CORS, иначе браузер их не отдаст
клиентскому коду.
"""

from fastapi import Query, Response
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import Select

# Верхняя граница размера страницы. Раньше её не было вовсе: `?limit=100000`
# выгружал таблицу целиком одним запросом. Порог выбран с запасом — самый
# крупный существующий запрос клиентов равен 200 (админка).
MAX_PAGE_SIZE = 500

PAGINATION_HEADERS = ["X-Total-Count", "X-Skip", "X-Limit", "X-Has-More"]


def skip_param(default: int = 0) -> int:
    return Query(default=default, ge=0, description="Смещение выдачи")


def limit_param(default: int = 20) -> int:
    return Query(
        default=default,
        ge=1,
        le=MAX_PAGE_SIZE,
        description=f"Размер страницы, максимум {MAX_PAGE_SIZE}",
    )


async def count_rows(db: AsyncSession, query: Select) -> int:
    """Сколько строк вернул бы запрос без offset/limit.

    Считаем по подзапросу, а не переписывая select: у выборок есть join-ы,
    `distinct` и `order_by`, и повторять их вручную значило бы держать две
    расходящиеся версии одного условия.
    """
    counted = query.order_by(None).limit(None).offset(None)
    result = await db.execute(select(func.count()).select_from(counted.subquery()))
    return int(result.scalar() or 0)


def set_pagination_headers(response: Response, *, total: int, skip: int, limit: int) -> None:
    response.headers["X-Total-Count"] = str(total)
    response.headers["X-Skip"] = str(skip)
    response.headers["X-Limit"] = str(limit)
    response.headers["X-Has-More"] = "true" if skip + limit < total else "false"


async def paginate(
    db: AsyncSession, response: Response, query: Select, *, skip: int, limit: int
) -> Select:
    """Посчитать общее число строк, выставить заголовки и вернуть запрос со срезом."""
    total = await count_rows(db, query)
    set_pagination_headers(response, total=total, skip=skip, limit=limit)
    return query.offset(skip).limit(limit)
