import os
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.core.pagination import limit_param, paginate, skip_param
from app.models.brand import Brand
from app.models.product import Product
from app.core.visibility import visible_to_customer
from app.schemas.brand import BrandCreate, BrandUpdate, BrandResponse
from app.core.dependencies import require_permissions
from app.core.permissions import Perm
from app.core.images import check_content_type, process_upload

router = APIRouter()

BRAND_IMAGES_DIR = "uploads/brands"
os.makedirs(BRAND_IMAGES_DIR, exist_ok=True)


async def get_brand_or_404(brand_id: int, db: AsyncSession) -> Brand:
    result = await db.execute(select(Brand).where(Brand.id == brand_id))
    brand = result.scalar_one_or_none()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand


@router.post("/", response_model=BrandResponse, status_code=status.HTTP_201_CREATED)
async def create_brand(
    payload: BrandCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.BRANDS_CREATE))
):
    result = await db.execute(select(Brand).where(Brand.name == payload.name))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Brand with this name already exists")

    brand = Brand(name=payload.name)
    db.add(brand)
    await db.commit()
    await db.refresh(brand)
    return brand


@router.get("/", response_model=list[BrandResponse])
async def get_brands(
    response: Response = None,  # type: ignore[assignment]
    skip: int = skip_param(),
    limit: int = limit_param(20),
    name: Optional[str] = Query(default=None),
    is_active: Optional[bool] = Query(
        default=None,
        description="Фильтр по признаку активности; без него возвращаются и заблокированные",
    ),
    has_products: bool = Query(
        default=False,
        description="Только бренды, у которых есть товары, видимые покупателю",
    ),
    db: AsyncSession = Depends(get_db),
):
    query = select(Brand)
    if name:
        query = query.where(Brand.name.ilike(f"%{name}%"))
    # Без этого фильтра блокировка бренда (PATCH /brands/{id}/block) ни на что
    # не влияла: заблокированный бренд оставался в каталоге.
    if is_active is not None:
        query = query.where(Brand.is_active == is_active)
    # Каталог брендов на витрине вёл в пустые страницы: бренд заводится в
    # справочнике раньше, чем у него появляются товары.
    if has_products:
        visible = await visible_to_customer(
            select(Product.brand_id).where(Product.brand_id.isnot(None)), db
        )
        query = query.where(Brand.id.in_(visible))
    query = query.order_by(Brand.name)
    result = await db.execute(await paginate(db, response, query, skip=skip, limit=limit))
    return result.scalars().all()


@router.get("/{brand_id}", response_model=BrandResponse)
async def get_brand(
    brand_id: int,
    db: AsyncSession = Depends(get_db),
):
    return await get_brand_or_404(brand_id, db)


@router.put("/{brand_id}", response_model=BrandResponse)
async def update_brand(
    brand_id: int,
    payload: BrandUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.BRANDS_UPDATE))
):
    brand = await get_brand_or_404(brand_id, db)

    conflict = await db.execute(
        select(Brand).where(Brand.name == payload.name, Brand.id != brand_id)
    )
    if conflict.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Brand with this name already exists")

    brand.name = payload.name
    await db.commit()
    await db.refresh(brand)
    return brand


@router.post("/{brand_id}/image", response_model=BrandResponse)
async def upload_brand_image(
    brand_id: int,
    image: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.BRANDS_UPDATE))
):
    brand = await get_brand_or_404(brand_id, db)

    check_content_type(image)
    content = await image.read()
    filepath = f"{BRAND_IMAGES_DIR}/brand_{brand_id}_{uuid.uuid4().hex}.webp"
    # Нормализация вынесена в app/core/images.py: она сама отвечает
    # понятной 400-й, поэтому находится вне общего try.
    process_upload(content, filepath, image.filename or "image")

    try:
        if brand.image_path and os.path.exists(brand.image_path):
            try:
                os.remove(brand.image_path)
            except Exception:
                pass

        brand.image_path = filepath
        await db.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")

    await db.refresh(brand)
    return brand


@router.patch("/{brand_id}/block", response_model=BrandResponse)
async def block_brand(
    brand_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.BRANDS_BLOCK))
):
    brand = await get_brand_or_404(brand_id, db)
    if not brand.is_active:
        raise HTTPException(status_code=400, detail="Brand is already blocked")

    brand.is_active = False
    await db.commit()
    await db.refresh(brand)
    return brand


@router.patch("/{brand_id}/unblock", response_model=BrandResponse)
async def unblock_brand(
    brand_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.BRANDS_BLOCK))
):
    brand = await get_brand_or_404(brand_id, db)
    if brand.is_active:
        raise HTTPException(status_code=400, detail="Brand is already active")

    brand.is_active = True
    await db.commit()
    await db.refresh(brand)
    return brand