import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.core.pagination import limit_param, paginate, skip_param
from app.models.category import Category
from app.models.category_translation import CategoryTranslation
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.core.dependencies import require_permissions
from app.core.permissions import Perm
from app.core.images import remove_files, check_content_type, process_upload

router = APIRouter()

CATEGORY_IMAGES_DIR = "uploads/categories"
os.makedirs(CATEGORY_IMAGES_DIR, exist_ok=True)


def _category_query():
    return select(Category).options(
        selectinload(Category.translations),
        selectinload(Category.parent).selectinload(Category.translations),
        selectinload(Category.children).selectinload(Category.translations),
    )


async def get_category_or_404(category_id: int, db: AsyncSession) -> Category:
    result = await db.execute(
        _category_query().where(Category.id == category_id)
    )
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    payload: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.CATEGORIES_CREATE))
):
    if not payload.translations:
        raise HTTPException(status_code=400, detail="At least one translation is required")

    if payload.parent_id:
        result = await db.execute(select(Category).where(Category.id == payload.parent_id))
        parent = result.scalar_one_or_none()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent category not found")
        if not parent.is_active:
            raise HTTPException(status_code=400, detail="Parent category is blocked")

    category = Category(parent_id=payload.parent_id)
    db.add(category)
    await db.flush()

    for t in payload.translations:
        db.add(CategoryTranslation(category_id=category.id, language=t.language, name=t.name))

    await db.commit()
    return await get_category_or_404(category.id, db)


@router.get("/", response_model=list[CategoryResponse])
async def get_categories(
    response: Response = None,  # type: ignore[assignment]
    skip: int = skip_param(),
    limit: int = limit_param(20),
    only_parents: bool = False,
    is_active: bool | None = Query(default=None, description="Фильтр по статусу активности категории"),
    search: str | None = Query(default=None, description="Поиск по части имени категории на любом языке"),
    db: AsyncSession = Depends(get_db),
):
    query = _category_query()
    if only_parents:
        query = query.where(Category.parent_id == None)
    if is_active is not None:
        query = query.where(Category.is_active == is_active)
    if search and search.strip():
        query = query.where(
            Category.translations.any(CategoryTranslation.name.ilike(f"%{search.strip()}%"))
        )
    result = await db.execute(await paginate(db, response, query, skip=skip, limit=limit))
    return result.scalars().all()


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
):
    return await get_category_or_404(category_id, db)


async def _would_create_cycle(category_id: int, new_parent_id: int, db: AsyncSession) -> bool:
    """
    Станет ли дерево циклом, если у category_id родителем сделать new_parent_id.

    Проверялось только «сама себе родитель», поэтому цикл собирался в два
    запроса: сначала B получал родителем A, затем A — родителем B. После этого
    любой обход дерева (в том числе правило видимости товаров) уходил в петлю.
    Идём вверх от нового родителя: если добрались до самой категории — цикл.
    """
    node = new_parent_id
    seen: set[int] = set()
    while node is not None and node not in seen:
        if node == category_id:
            return True
        seen.add(node)
        row = await db.execute(select(Category.parent_id).where(Category.id == node))
        node = row.scalar_one_or_none()
    return False


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    payload: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.CATEGORIES_UPDATE))
):
    category = await get_category_or_404(category_id, db)

    if payload.parent_id is not None:
        if payload.parent_id == category_id:
            raise HTTPException(status_code=400, detail="Category cannot be its own parent")
        result = await db.execute(select(Category).where(Category.id == payload.parent_id))
        parent = result.scalar_one_or_none()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent category not found")
        if not parent.is_active:
            raise HTTPException(status_code=400, detail="Parent category is blocked")
        if await _would_create_cycle(category_id, payload.parent_id, db):
            raise HTTPException(
                status_code=400,
                detail="Parent category is a descendant of this category",
            )
        category.parent_id = payload.parent_id

    if payload.translations:
        existing = {t.language: t for t in category.translations}
        for t in payload.translations:
            if t.language in existing:
                existing[t.language].name = t.name
            else:
                db.add(CategoryTranslation(category_id=category.id, language=t.language, name=t.name))

    await db.commit()
    return await get_category_or_404(category_id, db)


@router.post("/{category_id}/image", response_model=CategoryResponse)
async def upload_category_image(
    category_id: int,
    image: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.CATEGORIES_UPDATE))
):
    category = await get_category_or_404(category_id, db)

    check_content_type(image)
    content = await image.read()
    filepath = f"{CATEGORY_IMAGES_DIR}/cat_{category_id}_{uuid.uuid4().hex}.webp"
    # Нормализация вынесена в app/core/images.py: она сама отвечает
    # понятной 400-й, поэтому находится вне общего try.
    process_upload(content, filepath, image.filename or "image")

    # Прежняя картинка стирается после коммита: при неудачной фиксации ссылка
    # в базе указывала бы на уже удалённый файл.
    replaced_image = category.image_path
    category.image_path = filepath
    await db.commit()
    remove_files([replaced_image])

    return await get_category_or_404(category_id, db)


@router.patch("/{category_id}/block", response_model=CategoryResponse)
async def block_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.CATEGORIES_BLOCK))
):
    category = await get_category_or_404(category_id, db)
    if not category.is_active:
        raise HTTPException(status_code=400, detail="Category is already blocked")

    # Подкатегории больше не гасятся своим флагом. Раньше блокировка писала
    # is_active=false прямым детям, а разблокировка их не возвращала — дети
    # оставались выключенными навсегда, и понять причину было нельзя. К тому же
    # гасился только один уровень, так что внуки продолжали торговать.
    # Теперь правило видимости (app/core/visibility.py) само проверяет всю цепочку
    # родителей, поэтому достаточно выключить саму категорию.
    category.is_active = False
    await db.commit()
    return await get_category_or_404(category_id, db)


@router.patch("/{category_id}/unblock", response_model=CategoryResponse)
async def unblock_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.CATEGORIES_BLOCK))
):
    category = await get_category_or_404(category_id, db)
    if category.is_active:
        raise HTTPException(status_code=400, detail="Category is already active")

    if category.parent and not category.parent.is_active:
        raise HTTPException(status_code=400, detail="Cannot unblock: parent category is still blocked")

    category.is_active = True
    await db.commit()
    return await get_category_or_404(category_id, db)
