from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import aliased
from app.database import get_db
from app.models.user import User
from app.models.permission import Permission
from app.models.user_permission import UserPermission
from app.core.dependencies import get_current_user, require_permissions
from app.core.permissions import Perm, ALL_PERMISSIONS
from app.schemas.user import UserPermissionGrantResponse, GrantPermissionRequest, BulkGrantRequest, PermissionResponse

router = APIRouter()


async def get_user_or_404(user_id: int, db: AsyncSession) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


async def get_permission_by_code(code: str, db: AsyncSession) -> Permission:
    result = await db.execute(select(Permission).where(Permission.code == code))
    perm = result.scalar_one_or_none()
    if not perm:
        raise HTTPException(
            status_code=404,
            detail=f"Permission '{code}' not found. Check GET /permissions for available codes."
        )
    return perm


# ── Просмотр всех доступных прав в системе ──────────────────────────────────

@router.get("/", response_model=list[PermissionResponse], tags=["Permissions"])
async def list_all_permissions(
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.USERS_READ)),
):
    """Список всех доступных в системе прав."""
    result = await db.execute(select(Permission).order_by(Permission.code))
    return result.scalars().all()


# ── Управление правами конкретного пользователя ──────────────────────────────

@router.get("/{user_id}/permissions", response_model=list[UserPermissionGrantResponse])
async def get_user_permissions(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.USERS_READ)),
):
    """
    Права пользователя вместе с тем, кто и когда их выдал.

    granted_at и granted_by писались, но не читались нигде — аудит выдачи прав
    был недостижим. Пустой granted_by означает системную выдачу: регистрация
    по SMS и первичное заполнение прав.
    """
    await get_user_or_404(user_id, db)

    granter = aliased(User)
    result = await db.execute(
        select(
            Permission.id,
            Permission.code,
            Permission.description,
            UserPermission.granted_at,
            UserPermission.granted_by,
            granter.username,
        )
        .join(UserPermission, UserPermission.permission_id == Permission.id)
        .outerjoin(granter, granter.id == UserPermission.granted_by)
        .where(UserPermission.user_id == user_id)
        .order_by(Permission.code)
    )
    return [
        UserPermissionGrantResponse(
            id=row.id,
            code=row.code,
            description=row.description,
            granted_at=row.granted_at,
            granted_by=row.granted_by,
            granted_by_username=row.username,
        )
        for row in result.all()
    ]


@router.post("/{user_id}/permissions", response_model=list[PermissionResponse], status_code=status.HTTP_201_CREATED)
async def grant_permission(
    user_id: int,
    payload: GrantPermissionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.USERS_MANAGE_PERMISSIONS)),
):
    """Назначить одно право пользователю."""
    user = await get_user_or_404(user_id, db)
    perm = await get_permission_by_code(payload.permission_code, db)

    # Check if already granted
    existing = await db.execute(
        select(UserPermission).where(
            UserPermission.user_id == user_id,
            UserPermission.permission_id == perm.id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"User already has permission '{perm.code}'")

    link = UserPermission(
        user_id=user_id,
        permission_id=perm.id,
        granted_by=current_user.id,
    )
    db.add(link)
    await db.commit()
    await db.refresh(user)
    return user.permissions


@router.post("/{user_id}/permissions/bulk", response_model=list[PermissionResponse], status_code=status.HTTP_201_CREATED)
async def bulk_grant_permissions(
    user_id: int,
    payload: BulkGrantRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.USERS_MANAGE_PERMISSIONS)),
):
    """Назначить несколько прав сразу."""
    user = await get_user_or_404(user_id, db)

    for code in payload.permission_codes:
        perm = await get_permission_by_code(code, db)

        existing = await db.execute(
            select(UserPermission).where(
                UserPermission.user_id == user_id,
                UserPermission.permission_id == perm.id,
            )
        )
        if existing.scalar_one_or_none():
            continue  # Skip already granted

        link = UserPermission(
            user_id=user_id,
            permission_id=perm.id,
            granted_by=current_user.id,
        )
        db.add(link)

    await db.commit()
    await db.refresh(user)
    return user.permissions


async def _ensure_keeps_own_permission_control(
    user_id: int,
    current_user: User,
    db: AsyncSession,
    remaining_codes: set[str] | None = None,
) -> None:
    """
    Не даёт администратору снять у себя право управления правами.

    У блокировки пользователя такая защита есть («Cannot block yourself»),
    здесь её не было. Снятое у себя право вернуть нечем: другого эндпоинта
    нет, DELETE /users/{id} отвечает 405 — оставалась только правка базы
    руками. `remaining_codes` передаётся там, где права заменяются целиком:
    если управление правами есть в новом наборе, операция безопасна.
    """
    if user_id != current_user.id:
        return
    if remaining_codes is not None and Perm.USERS_MANAGE_PERMISSIONS in remaining_codes:
        return
    raise HTTPException(
        status_code=400,
        detail="Cannot revoke your own permission management rights",
    )


@router.delete("/{user_id}/permissions/{permission_code}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_permission(
    user_id: int,
    permission_code: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.USERS_MANAGE_PERMISSIONS)),
):
    """Отозвать право у пользователя."""
    await get_user_or_404(user_id, db)
    if permission_code == Perm.USERS_MANAGE_PERMISSIONS:
        await _ensure_keeps_own_permission_control(user_id, current_user, db)
    perm = await get_permission_by_code(permission_code, db)

    result = await db.execute(
        select(UserPermission).where(
            UserPermission.user_id == user_id,
            UserPermission.permission_id == perm.id,
        )
    )
    link = result.scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=404, detail=f"User does not have permission '{permission_code}'")

    await db.delete(link)
    await db.commit()


@router.delete("/{user_id}/permissions", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_all_permissions(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.USERS_MANAGE_PERMISSIONS)),
):
    """Отозвать ВСЕ права у пользователя."""
    await get_user_or_404(user_id, db)
    await _ensure_keeps_own_permission_control(user_id, current_user, db)

    result = await db.execute(
        select(UserPermission).where(UserPermission.user_id == user_id)
    )
    links = result.scalars().all()
    for link in links:
        await db.delete(link)

    await db.commit()

#Добавлено мной по просьбе Селима(этот роут необходим)
@router.put("/{user_id}/permissions", response_model=list[PermissionResponse])
async def set_user_permissions(
    user_id: int,
    payload: BulkGrantRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.USERS_MANAGE_PERMISSIONS)),
):
    """Атомарно заменить все права пользователя."""
    await get_user_or_404(user_id, db)
    await _ensure_keeps_own_permission_control(
        user_id, current_user, db, remaining_codes=set(payload.permission_codes)
    )

    result = await db.execute(
        select(UserPermission).where(UserPermission.user_id == user_id)
    )
    for link in result.scalars().all():
        await db.delete(link)

    # Flush deletes before inserts — MySQL checks UniqueConstraint immediately per row
    await db.flush()

    for code in dict.fromkeys(payload.permission_codes):
        perm = await get_permission_by_code(code, db)
        db.add(UserPermission(user_id=user_id, permission_id=perm.id, granted_by=current_user.id))

    await db.commit()

    # Re-query permissions directly; refresh() doesn't reload selectin relationships
    result = await db.execute(
        select(Permission)
        .join(UserPermission, UserPermission.permission_id == Permission.id)
        .where(UserPermission.user_id == user_id)
        .order_by(Permission.code)
    )
    return result.scalars().all()