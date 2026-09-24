from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, require_permissions
from app.core.permissions import Perm
from app.database import get_db
from app.models.user import User
from app.models.user_address import UserAddress
from app.schemas.user_address import (
    UserAddressCreateRequest,
    UserAddressResponse,
    UserAddressUpdateRequest,
)

router = APIRouter()


async def _own_address_or_404(address_id: int, user_id: int, db: AsyncSession) -> UserAddress:
    """
    Достаёт адрес и сразу проверяет владельца.

    Отказ — 404, а не 403: сообщать «такой адрес есть, но не твой» значит
    подтверждать существование чужой записи. Адрес — это домашний адрес
    человека, и подбором по номерам находить, какие из них заведены, не должно
    быть возможно.
    """
    result = await db.execute(
        select(UserAddress).where(UserAddress.id == address_id, UserAddress.user_id == user_id)
    )
    address = result.scalar_one_or_none()
    if address is None:
        raise HTTPException(status_code=404, detail="Address not found")
    return address


async def _clear_default(db: AsyncSession, user_id: int, keep_id: int | None = None) -> None:
    """Снимает признак основного со всех адресов пользователя, кроме указанного."""
    stmt = update(UserAddress).where(
        UserAddress.user_id == user_id, UserAddress.is_default.is_(True)
    )
    if keep_id is not None:
        stmt = stmt.where(UserAddress.id != keep_id)
    await db.execute(stmt.values(is_default=False))


@router.get("/", response_model=list[UserAddressResponse])
async def list_addresses(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.ADDRESSES_READ)),
):
    """Свои адреса. Чужих в выдаче нет: фильтр по владельцу, а не по запросу."""
    result = await db.execute(
        select(UserAddress)
        .where(UserAddress.user_id == current_user.id)
        .order_by(UserAddress.is_default.desc(), UserAddress.id.desc())
    )
    return result.scalars().all()


@router.post("/", response_model=UserAddressResponse, status_code=status.HTTP_201_CREATED)
async def create_address(
    payload: UserAddressCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.ADDRESSES_MANAGE)),
):
    """
    Добавить адрес.

    Первый адрес становится основным независимо от запроса: иначе у человека с
    единственным адресом при оформлении не подставлялось бы ничего, и смысл
    сохранения пропадал.
    """
    existing = await db.execute(
        select(UserAddress.id).where(UserAddress.user_id == current_user.id).limit(1)
    )
    is_first = existing.scalar_one_or_none() is None
    make_default = payload.is_default or is_first

    if make_default:
        await _clear_default(db, current_user.id)

    address = UserAddress(
        user_id=current_user.id,
        title=payload.title,
        address=payload.address,
        is_default=make_default,
    )
    db.add(address)
    await db.commit()
    await db.refresh(address)
    return address


@router.put("/{address_id}", response_model=UserAddressResponse)
async def update_address(
    address_id: int,
    payload: UserAddressUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.ADDRESSES_MANAGE)),
):
    """
    Правка адреса.

    Признак основного здесь не меняется — для этого отдельный метод: снять флаг
    у прежнего и поставить новому надо одной операцией, иначе основными
    оказываются два адреса или ни один.
    """
    address = await _own_address_or_404(address_id, current_user.id, db)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(address, field, value)

    await db.commit()
    await db.refresh(address)
    return address


@router.patch("/{address_id}/default", response_model=UserAddressResponse)
async def set_default_address(
    address_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.ADDRESSES_MANAGE)),
):
    """Сделать адрес основным: он и подставляется при оформлении."""
    address = await _own_address_or_404(address_id, current_user.id, db)
    await _clear_default(db, current_user.id, keep_id=address_id)
    address.is_default = True
    await db.commit()
    await db.refresh(address)
    return address


@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_address(
    address_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.ADDRESSES_MANAGE)),
):
    """
    Удалить адрес.

    Если удалили основной, основным становится следующий: иначе у человека с
    парой адресов при оформлении перестало бы подставляться что-либо, хотя
    адреса есть.
    """
    address = await _own_address_or_404(address_id, current_user.id, db)
    was_default = address.is_default

    await db.delete(address)
    await db.flush()

    if was_default:
        result = await db.execute(
            select(UserAddress)
            .where(UserAddress.user_id == current_user.id)
            .order_by(UserAddress.id.desc())
            .limit(1)
        )
        nxt = result.scalar_one_or_none()
        if nxt is not None:
            nxt.is_default = True

    await db.commit()
    return None
