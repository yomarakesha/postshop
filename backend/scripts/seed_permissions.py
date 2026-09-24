"""
Идемпотентный seed всех ACL-прав из ALL_PERMISSIONS.
Запускать после каждого деплоя вместе с `alembic upgrade head`.

Использование:
    python scripts/seed_permissions.py
"""
import sys
import os
import asyncio

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy import select
from app.database import AsyncSessionLocal, engine
from app.models.permission import Permission
from app.models.user_permission import UserPermission
from app.core.permissions import ALL_PERMISSIONS, Perm


async def seed_permissions():
    async with AsyncSessionLocal() as db:
        seeded = 0
        updated = 0

        for perm_data in ALL_PERMISSIONS:
            result = await db.execute(
                select(Permission).where(Permission.code == perm_data["code"])
            )
            existing = result.scalar_one_or_none()
            if not existing:
                perm = Permission(**perm_data)
                db.add(perm)
                seeded += 1
            elif existing.description != perm_data["description"]:
                existing.description = perm_data["description"]
                updated += 1

        await db.commit()

        # Выдать администраторам (у кого есть users:manage_permissions) ВСЕ права,
        # а не только заведённые этим прогоном.
        #
        # Раньше выдавались только права, созданные этим же прогоном. Права,
        # заведённые где-то ещё, админам не доставались вообще: миграция создаёт
        # право сама (ей это нужно, чтобы тут же кому-то его выдать), сеялка
        # потом видит его существующим и пропускает. Так право reviews:moderate
        # не получил бы никто, и модерация отзывов оказалась бы недоступна на
        # рабочем сервере — при том что оба шага деплоя прошли успешно.
        #
        # Полный проход самоисправляющийся: откуда бы право ни появилось,
        # администратор его получит.
        granted = 0
        admin_ids: list[int] = []
        admin_perm_result = await db.execute(
            select(Permission).where(Permission.code == Perm.USERS_MANAGE_PERMISSIONS)
        )
        admin_perm = admin_perm_result.scalar_one_or_none()
        if admin_perm:
            admin_links = await db.execute(
                select(UserPermission.user_id).where(
                    UserPermission.permission_id == admin_perm.id
                )
            )
            admin_ids = [row[0] for row in admin_links.fetchall()]

            all_perms = await db.execute(select(Permission.id))
            all_perm_ids = [row[0] for row in all_perms.fetchall()]

            for user_id in admin_ids:
                held = await db.execute(
                    select(UserPermission.permission_id).where(
                        UserPermission.user_id == user_id
                    )
                )
                held_ids = {row[0] for row in held.fetchall()}
                for perm_id in all_perm_ids:
                    if perm_id not in held_ids:
                        db.add(UserPermission(user_id=user_id, permission_id=perm_id))
                        granted += 1

            await db.commit()

        total = len(ALL_PERMISSIONS)
        skipped = total - seeded - updated
        print(f"[OK] Permissions: {total} total - {seeded} added, {updated} updated, {skipped} already up to date.")
        if granted:
            print(f"[OK] Granted {granted} new permission(s) to {len(admin_ids)} admin(s).")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed_permissions())
