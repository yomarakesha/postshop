from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.core.pagination import limit_param, paginate, skip_param
from app.models.warehouse import Warehouse
from app.schemas.warehouse import WarehouseCreate, WarehouseUpdate, WarehouseResponse
from app.core.dependencies import require_permissions
from app.core.permissions import Perm

router = APIRouter()


async def get_warehouse_or_404(warehouse_id: int, db: AsyncSession) -> Warehouse:
    result = await db.execute(select(Warehouse).where(Warehouse.id == warehouse_id))
    warehouse = result.scalar_one_or_none()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return warehouse


@router.post("/", response_model=WarehouseResponse, status_code=status.HTTP_201_CREATED)
async def create_warehouse(
    payload: WarehouseCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.WAREHOUSES_CREATE)),
):
    warehouse = Warehouse(
        name=payload.name,
        address=payload.address,
        phone_numbers=payload.phone_numbers,
    )
    db.add(warehouse)
    await db.commit()
    await db.refresh(warehouse)
    return warehouse


@router.get("/", response_model=list[WarehouseResponse])
async def get_warehouses(
    response: Response = None,  # type: ignore[assignment]
    skip: int = skip_param(),
    limit: int = limit_param(20),
    name: Optional[str] = Query(default=None),
    is_active: Optional[bool] = Query(default=None),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.WAREHOUSES_READ)),
):
    query = select(Warehouse)
    if name:
        query = query.where(Warehouse.name.ilike(f"%{name}%"))
    if is_active is not None:
        query = query.where(Warehouse.is_active == is_active)
    result = await db.execute(await paginate(db, response, query, skip=skip, limit=limit))
    return result.scalars().all()


@router.get("/{warehouse_id}", response_model=WarehouseResponse)
async def get_warehouse(
    warehouse_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.WAREHOUSES_READ)),
):
    return await get_warehouse_or_404(warehouse_id, db)


@router.put("/{warehouse_id}", response_model=WarehouseResponse)
async def update_warehouse(
    warehouse_id: int,
    payload: WarehouseUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.WAREHOUSES_UPDATE)),
):
    warehouse = await get_warehouse_or_404(warehouse_id, db)

    if payload.name is not None:
        warehouse.name = payload.name
    if payload.address is not None:
        warehouse.address = payload.address
    if payload.phone_numbers is not None:
        warehouse.phone_numbers = payload.phone_numbers

    await db.commit()
    await db.refresh(warehouse)
    return warehouse


@router.patch("/{warehouse_id}/block", response_model=WarehouseResponse)
async def block_warehouse(
    warehouse_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.WAREHOUSES_BLOCK)),
):
    warehouse = await get_warehouse_or_404(warehouse_id, db)
    if not warehouse.is_active:
        raise HTTPException(status_code=400, detail="Warehouse is already blocked")

    warehouse.is_active = False
    await db.commit()
    await db.refresh(warehouse)
    return warehouse


@router.patch("/{warehouse_id}/unblock", response_model=WarehouseResponse)
async def unblock_warehouse(
    warehouse_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.WAREHOUSES_BLOCK)),
):
    warehouse = await get_warehouse_or_404(warehouse_id, db)
    if warehouse.is_active:
        raise HTTPException(status_code=400, detail="Warehouse is already active")

    warehouse.is_active = True
    await db.commit()
    await db.refresh(warehouse)
    return warehouse
