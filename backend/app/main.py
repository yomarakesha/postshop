import asyncio
import logging

from app.config import settings
from contextlib import asynccontextmanager
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.requests import Request
from app.database import AsyncSessionLocal, engine
from app.core.pagination import PAGINATION_HEADERS
from app.core.features import require_fbo_enabled
from app.services.notifications import purge_old_notifications

Request.form.__kwdefaults__["max_part_size"] = 30 * 1024 * 1024  # 30 MB

from app.routers import (
    auth, brands, categories, countries, regions,
    cities, currencies, measure_units, users, user_permissions,
    shop_bases, shop_additionals, products, banners, collections, cart,
    favorites, delivery_message, warehouses, stock_operations, features,
    warehouse_operations, stock_receipts, order_statuses, pickup_points, orders,
    search, statistics, contact_us, user_addresses, reviews, notifications,
    returns,
)




import os

# Без настройки уровня сообщения приложения не попадают в вывод вовсе, и
# строка о режиме учёта — та, ради которой она добавлена, — просто теряется.
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def _notifications_cleanup_loop() -> None:
    """
    Фоновая уборка старых уведомлений.

    Таблица уведомлений росла без предела: внешних ключей на неё нет, из
    интерфейса записи не убирались, планировщика в проекте не было. Отдельная
    инфраструктура (celery, APScheduler) ради одного DELETE в сутки не нужна —
    задача живёт внутри процесса и умирает вместе с ним.

    Служба запускается одним воркером (см. postshop-mvp.service), поэтому цикл
    работает в единственном экземпляре. Даже если воркеров станет несколько,
    повторная уборка безвредна: удаление по сроку идемпотентно.
    """
    interval = settings.NOTIFICATIONS_PURGE_INTERVAL_HOURS * 3600
    while True:
        try:
            async with AsyncSessionLocal() as db:
                removed = await purge_old_notifications(
                    db, older_than_days=settings.NOTIFICATIONS_RETENTION_DAYS
                )
            if removed:
                logger.info(
                    "Уведомления: удалено %s старше %s дней",
                    removed,
                    settings.NOTIFICATIONS_RETENTION_DAYS,
                )
        except asyncio.CancelledError:
            raise
        except Exception:
            # Уборка вторична: её падение не должно ронять приложение и не
            # должно останавливать следующие попытки.
            logger.exception("Уведомления: уборка не удалась")
        await asyncio.sleep(interval)


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs("uploads", exist_ok=True)
    # Схема БД управляется только через Alembic (`alembic upgrade head`).
    # Режим склада платформы видно сразу: по интерфейсу не понять, принимает
    # ли платформа товар на хранение.
    logger.info(
        "Склад платформы FBO: %s; учёт FBS магазинов: всегда включён",
        "включён" if settings.FBO_ENABLED else "выключен (FBO_ENABLED=false)",
    )

    cleanup_task = None
    if settings.NOTIFICATIONS_PURGE_INTERVAL_HOURS > 0:
        cleanup_task = asyncio.create_task(_notifications_cleanup_loop())

    yield

    if cleanup_task is not None:
        cleanup_task.cancel()
        # Без ожидания отменённая задача успевает обратиться к уже закрытому
        # пулу соединений и оставляет в логах шум при каждой остановке.
        try:
            await cleanup_task
        except asyncio.CancelledError:
            pass

    await engine.dispose()
    print("Application shutting down")


app = FastAPI(
    title="Marketplace API",
    version="1.0.1",
    description="Marketplace backend with ACL-based access control",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    # Метаданные пагинации приходят заголовками (см. app/core/pagination.py).
    # Без expose_headers браузер их получает, но не отдаёт клиентскому коду.
    expose_headers=PAGINATION_HEADERS,
)

app.include_router(auth.router,              prefix="/auth",              tags=["Auth"])
app.include_router(users.router,             prefix="/users",             tags=["Users"])
app.include_router(user_permissions.router,  prefix="/permissions",       tags=["Permissions"])
app.include_router(brands.router,            prefix="/brands",            tags=["Brands"])
app.include_router(categories.router,        prefix="/categories",        tags=["Categories"])
app.include_router(countries.router,         prefix="/countries",         tags=["Countries"])
app.include_router(regions.router,           prefix="/regions",           tags=["Regions"])
app.include_router(cities.router,            prefix="/cities",            tags=["Cities"])
app.include_router(currencies.router,        prefix="/currencies",        tags=["Currencies"])
app.include_router(measure_units.router,     prefix="/measure-units",     tags=["Measure Units"])
app.include_router(shop_bases.router,        prefix="/shop-bases",        tags=["Shop Bases"])
app.include_router(shop_additionals.router,  prefix="/shop-additionals",  tags=["Shop Additionals"])
app.include_router(products.router,          prefix="/products",          tags=["Products"])
app.include_router(banners.router,           prefix="/banners",           tags=["Banners"])
app.include_router(collections.router,       prefix="/collections",       tags=["Collections"])
app.include_router(cart.router,              prefix="/cart",              tags=["Cart"])
app.include_router(favorites.router,         prefix="/favorites",         tags=["Favorites"])
app.include_router(user_addresses.router,     prefix="/user-addresses",    tags=["User Addresses"])
app.include_router(reviews.router,           prefix="/reviews",           tags=["Reviews"])
app.include_router(returns.router,           prefix="/returns",           tags=["Returns"])
app.include_router(notifications.router,     prefix="/notifications",     tags=["Notifications"])
# Склад платформы (FBO) закрыт целиком, когда выключен (FBO_ENABLED=false):
# спрятать разделы в интерфейсе мало — ручки остаются доступны по прямому
# адресу, и приёмку всё равно можно завести. Остатки магазинов (FBS) не
# закрываются: их магазин ведёт сам при любом значении флага.
app.include_router(warehouses.router,        prefix="/warehouses",        tags=["Warehouses"],
                   dependencies=[Depends(require_fbo_enabled)])
app.include_router(delivery_message.router,  prefix="/delivery-message",  tags=["Delivery Message"])
app.include_router(stock_operations.router,     prefix="/stock-operations",     tags=["Stock Operations"])
app.include_router(warehouse_operations.router, prefix="/warehouse-operations", tags=["Warehouse Operations"],
                   dependencies=[Depends(require_fbo_enabled)])
app.include_router(stock_receipts.router,       prefix="/stock-receipts",       tags=["Stock Receipts"],
                   dependencies=[Depends(require_fbo_enabled)])
app.include_router(features.router,             prefix="/features",             tags=["Features"])
app.include_router(order_statuses.router,       prefix="/order-statuses",       tags=["Order Statuses"])
app.include_router(pickup_points.router,        prefix="/pickup-points",        tags=["Pickup Points"])
app.include_router(orders.router,               prefix="/orders",               tags=["Orders"])
app.include_router(search.router,               prefix="/search",               tags=["Search"])
app.include_router(statistics.router,           prefix="/statistics",           tags=["Statistics"])
app.include_router(contact_us.router,           prefix="/contact-us",           tags=["Contact Us"])

# Документы магазинов — юридические сканы (паспорт, свидетельство). Папка
# uploads раздаётся как статика ради картинок товаров, и вместе с ними в сеть
# уходили документы: ссылку скачивал любой без токена. Маршрут объявлен ДО
# mount и потому перехватывает эти пути; файл выдаёт только
# GET /shop-bases/{shop_id}/documents/{filename} с проверкой владения.
@app.get("/uploads/documents/{path:path}", include_in_schema=False)
def documents_are_private(path: str):
    raise HTTPException(
        status_code=403,
        detail="Shop documents are private. "
               "Use GET /shop-bases/{shop_id}/documents/{filename} with a token.",
    )


app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "Marketplace API is running"}