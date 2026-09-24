"""
Идемпотентный seed справочника статусов заказов (order_statuses).
Запускать после каждого деплоя вместе с `alembic upgrade head`.

Использование:
    python scripts/seed_order_statuses.py
"""
import sys
import os
import asyncio

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy import select
from app.database import AsyncSessionLocal, engine
from app.models.order_status import OrderStatus, OrderStatusCode


async def seed_order_statuses():
    async with AsyncSessionLocal() as db:
        seeded = 0
        for code in OrderStatusCode:
            result = await db.execute(
                select(OrderStatus).where(OrderStatus.code == code)
            )
            if result.scalar_one_or_none() is None:
                db.add(OrderStatus(code=code, is_active=True))
                seeded += 1

        await db.commit()

        total = len(OrderStatusCode)
        print(f"[OK] Order statuses: {total} total - {seeded} added, {total - seeded} already present.")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed_order_statuses())
