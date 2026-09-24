import os
import uuid
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, case
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.core.pagination import limit_param, paginate, skip_param
from app.models.banner import BANNER_POSITION_ORDER, Banner, BannerPosition
from app.models.banner_image import BannerImage
from app.schemas.banner import BannerCreate, BannerUpdate, BannerResponse
from app.core.dependencies import require_permissions
from app.core.permissions import Perm
from app.core.images import remove_files, check_content_type, process_upload

from app.core.search import normalize_term, text_matches, translation_matches
from typing import Optional
router = APIRouter()

BANNER_IMAGES_DIR = "uploads/banners"
os.makedirs(BANNER_IMAGES_DIR, exist_ok=True)


def _banner_query():
    return select(Banner).options(selectinload(Banner.images))


async def get_banner_or_404(banner_id: int, db: AsyncSession) -> Banner:
    result = await db.execute(_banner_query().where(Banner.id == banner_id))
    banner = result.scalar_one_or_none()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    return banner


@router.post("/", response_model=BannerResponse, status_code=status.HTTP_201_CREATED)
async def create_banner(
    payload: BannerCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.BANNERS_CREATE))
):
    if payload.start_date and payload.end_date and payload.start_date > payload.end_date:
        raise HTTPException(status_code=400, detail="start_date must be before end_date")

    banner = Banner(
        name=payload.name,
        position=payload.position,
        link=payload.link,
        is_active=payload.is_active,
        priority=payload.priority,
        start_date=payload.start_date,
        end_date=payload.end_date,
    )
    db.add(banner)
    await db.commit()
    return await get_banner_or_404(banner.id, db)


@router.get("/", response_model=list[BannerResponse])
async def get_banners(
    response: Response = None,  # type: ignore[assignment]
    skip: int = skip_param(),
    limit: int = limit_param(20),
    only_active: bool = False,
    show_all: bool = False,
    position: BannerPosition | None = Query(
        default=None, description="Фильтр по месту на странице"
    ),
    name: Optional[str] = Query(default=None, description="Фильтр по части названия"),
    db: AsyncSession = Depends(get_db),
):
    query = _banner_query()
    # Поля поиска в админке не было, потому что искать было нечем: параметра
    # у метода не существовало, и найти запись за пределами первой страницы
    # оказывалось невозможно.
    term = normalize_term(name)
    if term:
        query = query.where(text_matches(term, Banner.name))
    if not show_all:
        today = date.today()
        query = query.where(
            and_(
                or_(Banner.start_date == None, Banner.start_date <= today),
                or_(Banner.end_date == None, Banner.end_date >= today),
            )
        )
    if only_active:
        query = query.where(Banner.is_active == True)
    if position is not None:
        query = query.where(Banner.position == position.value)
    # Раньше поле position только сохранялось: выдача не фильтровалась по нему и
    # не была от него упорядочена, поэтому баннеры шли в произвольном порядке
    # внутри одного приоритета. Сортируем сверху вниз по странице.
    position_rank = case(
        BANNER_POSITION_ORDER,
        value=Banner.position,
        else_=len(BANNER_POSITION_ORDER),
    )
    query = query.order_by(Banner.priority.asc(), position_rank.asc(), Banner.id.asc())
    result = await db.execute(await paginate(db, response, query, skip=skip, limit=limit))
    return result.scalars().all()


@router.get("/{banner_id}", response_model=BannerResponse)
async def get_banner(
    banner_id: int,
    db: AsyncSession = Depends(get_db),
):
    return await get_banner_or_404(banner_id, db)


@router.put("/{banner_id}", response_model=BannerResponse)
async def update_banner(
    banner_id: int,
    payload: BannerUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.BANNERS_UPDATE))
):
    banner = await get_banner_or_404(banner_id, db)

    data = payload.model_dump(exclude_unset=True)

    new_start = data["start_date"] if "start_date" in data else banner.start_date
    new_end   = data["end_date"]   if "end_date"   in data else banner.end_date
    if new_start and new_end and new_start > new_end:
        raise HTTPException(status_code=400, detail="start_date must be before end_date")

    if payload.name is not None:
        banner.name = payload.name
    if payload.position is not None:
        banner.position = payload.position
    if "link" in data:
        banner.link = data["link"]
    if payload.priority is not None:
        banner.priority = payload.priority
    if "start_date" in data:
        banner.start_date = data["start_date"]
    if "end_date" in data:
        banner.end_date = data["end_date"]

    await db.commit()
    return await get_banner_or_404(banner_id, db)


@router.delete("/{banner_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_banner(
    banner_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.BANNERS_DELETE))
):
    banner = await get_banner_or_404(banner_id, db)

    # Файлы стирались до db.delete: если удаление не проходило, баннер
    # оставался в базе, но уже без изображений.
    removed_images = [img.image_path for img in banner.images]

    await db.delete(banner)
    await db.commit()
    remove_files(removed_images)


@router.post("/{banner_id}/image", response_model=BannerResponse)
async def upload_banner_image(
    banner_id: int,
    language: str = Query(..., description="Language code, e.g. 'en', 'ru', 'tk'"),
    image: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.BANNERS_UPDATE))
):
    banner = await get_banner_or_404(banner_id, db)

    check_content_type(image)
    content = await image.read()
    filepath = f"{BANNER_IMAGES_DIR}/banner_{banner_id}_{language}_{uuid.uuid4().hex}.webp"
    process_upload(content, filepath, image.filename or "image")

    existing = {bi.language: bi for bi in banner.images}
    replaced_image: str | None = None
    if language in existing:
        replaced_image = existing[language].image_path
        existing[language].image_path = filepath
    else:
        db.add(BannerImage(banner_id=banner_id, language=language, image_path=filepath))

    await db.commit()
    remove_files([replaced_image])
    return await get_banner_or_404(banner_id, db)


@router.delete("/{banner_id}/image", response_model=BannerResponse)
async def delete_banner_image(
    banner_id: int,
    language: str = Query(..., description="Language code to remove image for"),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.BANNERS_UPDATE))
):
    banner = await get_banner_or_404(banner_id, db)

    existing = {bi.language: bi for bi in banner.images}
    if language not in existing:
        raise HTTPException(status_code=404, detail=f"No image found for language '{language}'")

    bi = existing[language]
    removed_image = bi.image_path
    await db.delete(bi)
    await db.commit()
    remove_files([removed_image])
    return await get_banner_or_404(banner_id, db)


@router.patch("/{banner_id}/block", response_model=BannerResponse)
async def block_banner(
    banner_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.BANNERS_BLOCK))
):
    banner = await get_banner_or_404(banner_id, db)
    if not banner.is_active:
        raise HTTPException(status_code=400, detail="Banner is already blocked")
    banner.is_active = False
    await db.commit()
    return await get_banner_or_404(banner_id, db)


@router.patch("/{banner_id}/unblock", response_model=BannerResponse)
async def unblock_banner(
    banner_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.BANNERS_BLOCK))
):
    banner = await get_banner_or_404(banner_id, db)
    if banner.is_active:
        raise HTTPException(status_code=400, detail="Banner is already active")
    banner.is_active = True
    await db.commit()
    return await get_banner_or_404(banner_id, db)
