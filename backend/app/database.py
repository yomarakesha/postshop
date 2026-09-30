from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=settings.MYSQL_POOL_SIZE,
    max_overflow=settings.MYSQL_MAX_OVERFLOW,
    pool_timeout=settings.MYSQL_POOL_TIMEOUT,
    pool_recycle=settings.MYSQL_POOL_RECYCLE,
    pool_pre_ping=True,
    echo=False,
    # NOW() в значениях по умолчанию берёт зону сессии. Закрепляем UTC, чтобы
    # время не зависело от настроек сервера MySQL (см. app/core/utc_datetime.py).
    connect_args={"init_command": "SET time_zone = '+00:00'"},
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)

Base = declarative_base()


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise