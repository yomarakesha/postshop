"""
Скрипт создания суперпользователя с полным набором ACL-прав.

Использование:
    python scripts/create_superuser.py
"""
import sys
import os
import asyncio

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.database import AsyncSessionLocal, engine
from app.models.user import User
from app.models.permission import Permission
from app.models.user_permission import UserPermission
from app.core.security import hash_password
from sqlalchemy import select


async def create_superuser():
    # Collect inputs BEFORE opening any DB connections
    username  = input("Enter superuser username: ").strip()
    name      = input("Enter first name: ").strip() or None
    surname   = input("Enter surname: ").strip() or None
    email     = input("Enter email (optional, press Enter to skip): ").strip() or None
    phone     = input("Enter phone (optional, press Enter to skip): ").strip() or None

    import getpass
    password = getpass.getpass("Enter password: ")
    confirm  = getpass.getpass("Confirm password: ")

    if password != confirm:
        print("[ERROR] Passwords do not match.")
        return

    if len(password) < 6:
        print("[ERROR] Password must be at least 6 characters.")
        return

    try:
        async with AsyncSessionLocal() as db:
            # Check username uniqueness
            result = await db.execute(select(User).where(User.username == username))
            if result.scalar_one_or_none():
                print(f"[ERROR] Username '{username}' already exists.")
                return

            # 1. Create the superuser
            user = User(
                name=name,
                surname=surname,
                username=username,
                email=email,
                phone=phone,
                password=hash_password(password),
                is_active=True,
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

            # 2. Grant ALL permissions
            all_perms_result = await db.execute(select(Permission))
            all_perms = all_perms_result.scalars().all()

            for perm in all_perms:
                db.add(UserPermission(user_id=user.id, permission_id=perm.id))
            await db.commit()

            print(f"\n[OK] Superuser created successfully!")
            print(f"   ID        : {user.id}")
            print(f"   Username  : {user.username}")
            print(f"   Name      : {user.name}")
            print(f"   Surname   : {user.surname}")
            print(f"   Permissions granted: {len(all_perms)}")

    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(create_superuser())
