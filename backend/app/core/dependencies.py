from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.core.security import decode_token
from app.models.user import User

bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    result = await db.execute(select(User).where(User.id == int(payload.get("sub"))))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
    return user


def require_permissions(*codes: str, hint: str | None = None):
    """
    Dependency-фабрика: проверяет, что у пользователя есть ВСЕ перечисленные права.

    Использование:
        @router.get("/", dependencies=[Depends(require_permissions(Perm.BRANDS_READ))])
        # или
        current_user: User = Depends(require_permissions(Perm.BRANDS_READ))

    `hint` дописывается к сообщению об отказе. Нужен там, где отсутствие права —
    это часть рабочей схемы, а не ошибка настройки: владелец магазина, например,
    сознательно не может подтвердить собственный приход товара, и голое
    «Access denied» выглядит как поломка, хотя всё работает как задумано.
    """
    async def checker(current_user: User = Depends(get_current_user)) -> User:
        user_codes = {p.code for p in current_user.permissions}
        missing = [c for c in codes if c not in user_codes]
        if missing:
            detail = f"Access denied. Missing permissions: {', '.join(missing)}"
            if hint:
                detail = f"{detail}. {hint}"
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=detail,
            )
        return current_user
    return checker