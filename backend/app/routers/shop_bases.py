import os
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query, Response
from typing import Callable, List, Optional
from fastapi.responses import FileResponse

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import exists, func, or_, select
from app.database import get_db
from app.core.pagination import limit_param, paginate, skip_param
from app.models.city import City
from app.models.region import Region
from app.models.country import Country
from sqlalchemy.orm import selectinload
from datetime import datetime, timezone
from app.core.antivirus import scan_document
from app.core.images import remove_files
from app.models.shop_base import DOCUMENT_KINDS_BY_ENTITY, DocumentKind, ShopBase, RegistrationStatus
from app.models.shop_additional import ShopAdditional
from app.models.user import User
from app.schemas.shop_base import ShopBaseCreate, ShopBaseUpdate, ShopBaseStatusUpdate, ShopBaseResponse, ShopFullResponse
from app.schemas.shop_additional import ShopAdditionalResponse
from app.core.dependencies import get_optional_user, require_permissions
from app.core.visibility import shop_public_conditions
from app.core.ownership import ensure_can_manage_shop, is_staff, STAFF_SHOPS
from app.core.permissions import Perm
from app.models.notification import NotificationKind
from app.services.notifications import notify
from app.services.stock import shop_close_blockers


from app.core.search import normalize_term
router = APIRouter()

UPLOAD_DIR = "uploads/documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Ограничения на документы магазина. Раньше их не было вовсе: принимался файл
# любого размера и любого типа, а имя бралось от клиента без обработки.
MAX_DOCUMENT_SIZE = 10 * 1024 * 1024  # 10 МБ
MAX_DOCUMENTS = 20

# Документы открывает сотрудник платформы у себя на компьютере, поэтому
# расширению и заявленному типу верить нельзя: оба задаёт отправитель, и
# исполняемый файл, названный passport.pdf, проходил проверку. Содержимое
# сверяется с сигнатурой формата.
#
# Word (.doc/.docx) больше не принимается: витрина его и не предлагала
# (поле выбора — картинки и PDF), а .doc — главный переносчик макросов.
# Каждому расширению — допустимые заявленные типы и проверка начала файла.
DOCUMENT_FORMATS: dict[str, tuple[set[str], Callable[[bytes], bool]]] = {
    ".pdf": ({"application/pdf"}, lambda head: head.startswith(b"%PDF-")),
    ".jpg": ({"image/jpeg"}, lambda head: head.startswith(b"\xff\xd8\xff")),
    ".jpeg": ({"image/jpeg"}, lambda head: head.startswith(b"\xff\xd8\xff")),
    ".png": ({"image/png"}, lambda head: head.startswith(b"\x89PNG\r\n\x1a\n")),
    ".webp": ({"image/webp"}, lambda head: head[:4] == b"RIFF" and head[8:12] == b"WEBP"),
}
ALLOWED_DOCUMENT_SUFFIXES = set(DOCUMENT_FORMATS)

# Пока заявка не одобрена, владелец может дослать или убрать документы. После
# одобрения набор документов — это то, что проверил модератор: подменить его
# молча значило бы работать по документам, которых никто не видел.
EDITABLE_DOCUMENT_STATUSES = {RegistrationStatus.pending, RegistrationStatus.rejected}

ALLOWED_STATUS_TRANSITIONS = {
    RegistrationStatus.pending: {
        RegistrationStatus.approved,
        RegistrationStatus.rejected,
        RegistrationStatus.suspended,
    },
    RegistrationStatus.approved: {
        RegistrationStatus.suspended,
    },
    RegistrationStatus.rejected: {
        RegistrationStatus.pending,
    },
    RegistrationStatus.suspended: {
        RegistrationStatus.approved,
    },
}

def _documents(shop_base: ShopBase) -> list[dict]:
    """Документы магазина списком объектов.

    Строки — старый формат (до видов документов): миграция их переводит, но
    читаем и их, чтобы запись, не прошедшая миграцию, не роняла выдачу.
    """
    return [
        doc if isinstance(doc, dict) else {"path": doc, "kind": None, "scan": "not_scanned"}
        for doc in (shop_base.documents or [])
    ]


def _display_name(filename: str | None) -> str | None:
    """Имя файла от продавца — только для показа: без пути и не длиннее 120."""
    name = Path(filename or "").name.strip()
    return name[:120] or None


def _ensure_documents_editable(shop_base: ShopBase, user: User) -> None:
    if is_staff(user, *STAFF_SHOPS):
        return
    if shop_base.registration_status not in EDITABLE_DOCUMENT_STATUSES:
        raise HTTPException(
            status_code=409,
            detail="Documents of a reviewed shop cannot be changed by the owner",
        )


def _check_document(file: UploadFile, contents: bytes) -> str:
    """Проверяет документ и возвращает расширение, под которым его сохранить."""
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in DOCUMENT_FORMATS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported document type '{suffix or file.filename}'. "
                   f"Allowed: {', '.join(sorted(ALLOWED_DOCUMENT_SUFFIXES))}",
        )
    content_types, matches = DOCUMENT_FORMATS[suffix]
    if file.content_type and file.content_type not in content_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported content type '{file.content_type}' for {suffix}",
        )
    if not contents or not matches(contents[:16]):
        raise HTTPException(
            status_code=400,
            detail=f"File {file.filename} is not a real {suffix} document",
        )
    return suffix


async def get_shop_base_or_404(shop_id: int, db: AsyncSession) -> ShopBase:
    result = await db.execute(select(ShopBase).where(ShopBase.id == shop_id))
    shop_base = result.scalar_one_or_none()
    if not shop_base:
        raise HTTPException(status_code=404, detail="Shop base not found")
    return shop_base


@router.post("/", response_model=ShopBaseResponse, status_code=status.HTTP_201_CREATED)
async def create_shop_base(
    payload: ShopBaseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.SHOP_BASES_CREATE)),
):
    shop_base = ShopBase(
        owner_id=current_user.id,
        legal_entity_type=payload.legal_entity_type,
        # Документы появляются только загрузкой файла. Список путей от клиента
        # не принимается: в нём можно было указать чужой файл
        # (uploads/documents/<другой магазин>_...) и скачать его как свой.
        documents=[],
        registration_status=RegistrationStatus.pending,
    )
    db.add(shop_base)
    await db.commit()
    await db.refresh(shop_base)
    return shop_base


@router.get("/", response_model=list[ShopBaseResponse])
async def get_shop_bases(
    response: Response = None,  # type: ignore[assignment]
    skip: int = skip_param(),
    limit: int = limit_param(20),
    registration_status: RegistrationStatus | None = Query(
        default=None, description="Фильтр по статусу регистрации магазина"
    ),
    search: Optional[str] = Query(
        default=None, description="Поиск по названию магазина, логину и телефону владельца"
    ),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.SHOP_BASES_READ)),
):
    # Реестр всех магазинов с владельцами и документами — админская выдача.
    # Владельцу показываем только его магазины.
    query = select(ShopBase)
    if registration_status is not None:
        query = query.where(ShopBase.registration_status == registration_status)

    # Админка посылала параметр search, которого у метода не существовало:
    # поиск магазинов молча не работал, а искать приходилось глазами.
    term = normalize_term(search)
    if term:
        like = f"%{term}%"
        query = query.where(
            or_(
                exists().where(
                    (ShopAdditional.shop_base_id == ShopBase.id) & ShopAdditional.name.ilike(like)
                ),
                exists().where(
                    (User.id == ShopBase.owner_id)
                    & or_(
                        User.username.ilike(like),
                        User.phone.ilike(like),
                        User.name.ilike(like),
                        User.surname.ilike(like),
                    )
                ),
            )
        )
    if not is_staff(current_user, *STAFF_SHOPS):
        query = query.where(ShopBase.owner_id == current_user.id)
    result = await db.execute(await paginate(db, response, query, skip=skip, limit=limit))
    return list(result.scalars().all())


@router.get("/full", response_model=list[ShopFullResponse])
async def get_all_shops_full(
    response: Response = None,  # type: ignore[assignment]
    skip: int = skip_param(),
    limit: int = limit_param(20),
    registration_status: RegistrationStatus | None = Query(
        default=None, description="Фильтр по статусу регистрации магазина"
    ),
    search: Optional[str] = Query(
        default=None, description="Поиск по названию магазина"
    ),
    db: AsyncSession = Depends(get_db),
    viewer: User | None = Depends(get_optional_user),
):
    # Город и его дерево загружаются сразу: сборка ответа по модели обращается
    # к связям, а ленивая загрузка в асинхронном режиме даёт MissingGreenlet.
    query = (
        select(ShopBase, ShopAdditional)
        .outerjoin(ShopAdditional, ShopAdditional.shop_base_id == ShopBase.id)
        .options(
            selectinload(ShopAdditional.city).options(
                selectinload(City.translations),
                selectinload(City.region).options(
                    selectinload(Region.translations),
                    selectinload(Region.country).selectinload(Country.translations),
                ),
            )
        )
    )
    if registration_status is not None:
        query = query.where(ShopBase.registration_status == registration_status)
    # Выдача публичная: витрина строит на ней список магазинов. Покупателю —
    # только открытые, одобренные и заполненные; админке — все.
    if viewer is None or not is_staff(viewer, *STAFF_SHOPS):
        query = query.where(*shop_public_conditions())

    # Список магазинов в админке построен на этой выдаче и посылал параметр
    # search, которого здесь не было: поиск молча не работал.
    term = normalize_term(search)
    if term:
        query = query.where(ShopAdditional.name.ilike(f"%{term}%"))

    result = await db.execute(
        await paginate(db, response, query, skip=skip, limit=limit)
    )
    rows = result.all()

    responses = []
    for shop, additional in rows:
        additional_resp = None
        if additional:
            # Раньше объект собирался перечислением полей вручную, и три из них
            # молча терялись: city_id, city и color_text. Сборка по модели их
            # сохраняет и не разъедется при добавлении новых полей.
            # Путь к логотипу отдаётся как хранится — относительным, как во
            # всех остальных методах. Раньше здесь приклеивался адрес запроса,
            # а за прокси это внутренний http://127.0.0.1:7002: браузер
            # посетителя до него не достаёт, и логотипы в списке магазинов
            # были битыми. Витрина и админка сами дописывают адрес бэкенда.
            additional_resp = ShopAdditionalResponse.model_validate(additional)

        responses.append(ShopFullResponse(
            id=shop.id,
            owner_id=shop.owner_id,
            legal_entity_type=shop.legal_entity_type,
            # Выдача публичная (витрине нужен список магазинов), поэтому ссылки
            # на юридические документы здесь не отдаём: раньше их скачивал
            # кто угодно без авторизации. Документы доступны владельцу и
            # сотруднику через GET /shop-bases/{id}.
            documents=[],
            is_active=shop.is_active,
            blocked_by_staff=bool(shop.blocked_by_staff),
            registration_status=shop.registration_status,
            created_at=shop.created_at,
            updated_at=shop.updated_at,
            additional=additional_resp,
        ))

    return responses


@router.get("/pending/count")
async def get_pending_shops_count(
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.USERS_READ))
):
    """Количество заявок на новый магазин (статус регистрации = pending)."""
    result = await db.execute(
        select(func.count())
        .select_from(ShopBase)
        .where(ShopBase.registration_status == RegistrationStatus.pending)
    )
    return {"count": result.scalar_one()}


@router.get("/{shop_id}", response_model=ShopBaseResponse)
async def get_shop_base(
    shop_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.SHOP_BASES_READ))
):
    """Карточка магазина с владельцем и документами — своя либо для сотрудника."""
    return await ensure_can_manage_shop(shop_id, current_user, db,
                                        detail="You can only read your own shops")


@router.put("/{shop_id}", response_model=ShopBaseResponse)
async def update_shop_base(
    shop_id: int,
    payload: ShopBaseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.SHOP_BASES_UPDATE))
):
    # Право shop_bases:update есть у каждого, а проверки владельца не было:
    # посторонний подменял тип юрлица и список документов чужого магазина.
    shop_base = await ensure_can_manage_shop(shop_id, current_user, db)

    if payload.legal_entity_type is not None:
        shop_base.legal_entity_type = payload.legal_entity_type
    if payload.documents is not None:
        # Список можно только сократить: добавить путь, которого магазин не
        # загружал, значило бы присвоить чужой документ.
        current_docs = _documents(shop_base)
        current_paths = {doc["path"] for doc in current_docs}
        foreign = [path for path in payload.documents if path not in current_paths]
        if foreign:
            raise HTTPException(
                status_code=400,
                detail="Documents are added by uploading files only",
            )
        _ensure_documents_editable(shop_base, current_user)
        shop_base.documents = [doc for doc in current_docs if doc["path"] in payload.documents]
        dropped = [doc["path"] for doc in current_docs if doc["path"] not in payload.documents]
    else:
        dropped = []

    await db.commit()
    # Убранные из заявки сканы стираются с диска — после коммита, как везде.
    remove_files(dropped)
    await db.refresh(shop_base)
    return shop_base


@router.patch("/{shop_id}/block", response_model=ShopBaseResponse)
async def block_shop_base(
    shop_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.SHOP_BASES_BLOCK))
):
    """Закрыть магазин. Владелец закрывает свой, сотрудник — любой.

    Владелец не может закрыть магазин, пока у него есть незавершённые дела:
    открытые заказы и одобренные, но не полученные возвраты. Раньше магазин
    закрывался молча — товары пропадали из каталога, а заказы покупателей
    оставались висеть без продавца. Сотрудника это не останавливает: закрытие
    платформой — решение, а не уход продавца, и заказы разбирает она же.
    """
    shop_base = await ensure_can_manage_shop(shop_id, current_user, db)
    if not shop_base.is_active:
        raise HTTPException(status_code=400, detail="Shop base is already blocked")

    by_staff = is_staff(current_user, *STAFF_SHOPS) and current_user.id != shop_base.owner_id
    if not by_staff:
        blockers = await shop_close_blockers(db, shop_id)
        if blockers:
            raise HTTPException(
                status_code=409,
                detail="Shop cannot be closed while it has unfinished work. Now: "
                       + "; ".join(blockers),
            )

    shop_base.is_active = False
    shop_base.blocked_by_staff = by_staff

    # Уведомляем, только если закрыл не сам владелец: себе сообщать о своём же
    # действии незачем, а вот закрытие сотрудником владелец иначе обнаружит
    # по пропавшим из каталога товарам.
    if current_user.id != shop_base.owner_id:
        await notify(
            db,
            user_id=shop_base.owner_id,
            kind=NotificationKind.shop_blocked,
            entity_id=shop_base.id,
        )

    await db.commit()
    await db.refresh(shop_base)
    return shop_base


@router.patch("/{shop_id}/unblock", response_model=ShopBaseResponse)
async def unblock_shop_base(
    shop_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.SHOP_BASES_BLOCK))
):
    """Снова открыть магазин. Владелец может вернуть свой.

    Но не тот, что закрыла платформа: раньше владелец снимал блокировку
    сотрудника одним запросом — права block/unblock у него есть, а кто
    поставил блок, не хранилось.
    """
    shop_base = await ensure_can_manage_shop(shop_id, current_user, db)
    if shop_base.is_active:
        raise HTTPException(status_code=400, detail="Shop base is already active")
    if shop_base.blocked_by_staff and not is_staff(current_user, *STAFF_SHOPS):
        raise HTTPException(
            status_code=403,
            detail="The shop was closed by the platform; only platform staff can reopen it",
        )

    shop_base.is_active = True
    shop_base.blocked_by_staff = False
    await db.commit()
    await db.refresh(shop_base)
    return shop_base


# Статус регистрации — модерация, а не действие продавца. Раньше владелец мог
# провести свой магазин из pending в approved, минуя проверку.
@router.patch("/{shop_id}/registration-status", response_model=ShopBaseResponse)
async def update_shop_base_registration_status(
    shop_id: int,
    payload: ShopBaseStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(Perm.USERS_READ))
):
    shop_base = await get_shop_base_or_404(shop_id, db)
    current_status = shop_base.registration_status
    next_status = payload.registration_status

    if current_status != next_status:
        allowed_next = ALLOWED_STATUS_TRANSITIONS.get(current_status, set())
        if next_status not in allowed_next:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Invalid status transition: {current_status.value} -> {next_status.value}. "
                    f"Allowed: {', '.join(sorted(s.value for s in allowed_next)) or 'none'}"
                ),
            )

    # Отклонение без причины оставляло владельца в тишине: поля для причины у
    # заявки не было вовсе, и узнать, что исправить, было негде.
    if next_status in (RegistrationStatus.rejected, RegistrationStatus.suspended):
        if not payload.registration_comment:
            raise HTTPException(
                status_code=400,
                detail="registration_comment is required to reject or suspend a shop",
            )
        shop_base.registration_comment = payload.registration_comment
    elif next_status == RegistrationStatus.approved:
        # Витрина не даёт подать заявку без всех документов, но API — даёт:
        # заявка без единого файла одобрялась так же, как полная.
        if current_status != next_status and not shop_base.documents:
            raise HTTPException(
                status_code=400,
                detail="Cannot approve a shop without documents",
            )
        # Одобрили — прежнее замечание больше не актуально.
        shop_base.registration_comment = None
    elif payload.registration_comment is not None:
        shop_base.registration_comment = payload.registration_comment

    shop_base.registration_status = payload.registration_status

    # Решение по заявке владелец узнавал, только зайдя и проверив. Уведомляем
    # об одобрении и об отказе; промежуточные состояния (на рассмотрении,
    # приостановлен) человек и так видит в кабинете баннером.
    if payload.registration_status == RegistrationStatus.approved:
        await notify(
            db,
            user_id=shop_base.owner_id,
            kind=NotificationKind.shop_approved,
            entity_id=shop_base.id,
        )
    elif payload.registration_status == RegistrationStatus.rejected:
        await notify(
            db,
            user_id=shop_base.owner_id,
            kind=NotificationKind.shop_rejected,
            entity_id=shop_base.id,
            comment=shop_base.registration_comment,
        )

    await db.commit()
    await db.refresh(shop_base)
    return shop_base


@router.get("/{shop_id}/documents/{filename}")
async def download_shop_document(
    shop_id: int,
    filename: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.SHOP_BASES_READ)),
):
    """
    Выдаёт документ магазина владельцу или сотруднику платформы.

    Файлы лежат в uploads/, который раздаётся как статика, поэтому раньше
    паспорт и свидетельство скачивал любой, кто знал ссылку, без токена.
    Прямой путь /uploads/documents/... теперь закрыт (см. app/main.py), а
    единственный способ получить файл — этот метод с проверкой владения.
    """
    shop_base = await ensure_can_manage_shop(shop_id, current_user, db)

    # Имя приходит из URL: берём только его последний сегмент, иначе
    # "../../.env" вывел бы за пределы папки загрузок.
    safe_name = Path(filename).name
    stored = f"{UPLOAD_DIR}/{safe_name}"
    if stored not in {doc["path"] for doc in _documents(shop_base)}:
        raise HTTPException(status_code=404, detail="Document not found")

    full_path = Path(stored)
    if not full_path.is_file():
        raise HTTPException(status_code=404, detail="Document file is missing on disk")

    # nosniff: браузер не должен угадывать тип по содержимому и исполнять
    # «картинку», внутри которой разметка.
    return FileResponse(
        full_path, filename=safe_name, headers={"X-Content-Type-Options": "nosniff"}
    )


@router.post("/{shop_id}/documents", response_model=ShopBaseResponse)
async def upload_shop_documents(
    shop_id: int,
    files: List[UploadFile] = File(...),
    kinds: List[DocumentKind] = Form(
        ..., description="Вид каждого файла, в том же порядке, что и files"
    ),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.SHOP_BASES_UPDATE))
):
    """
    Загрузка документов магазина. У каждого файла — вид (паспорт, патент…).

    Документ того же вида заменяет прежний: продавец досылает исправленный
    скан после отказа, и два «паспорта» в заявке модератору ни к чему.
    Каждый файл проверяется по формату и антивирусом до записи на диск.
    """
    # Документы магазина — юридические, чужие подмешивать нельзя.
    shop_base = await ensure_can_manage_shop(shop_id, current_user, db)
    _ensure_documents_editable(shop_base, current_user)

    if len(kinds) != len(files):
        raise HTTPException(
            status_code=422,
            detail=f"Each file needs its kind: got {len(files)} files and {len(kinds)} kinds",
        )
    if len(set(kinds)) != len(kinds):
        raise HTTPException(status_code=422, detail="Each document kind can be sent only once")
    allowed_kinds = DOCUMENT_KINDS_BY_ENTITY[shop_base.legal_entity_type]
    wrong = [kind.value for kind in kinds if kind not in allowed_kinds]
    if wrong:
        raise HTTPException(
            status_code=422,
            detail=f"Document kinds {', '.join(wrong)} do not match "
                   f"{shop_base.legal_entity_type.value}",
        )

    current_docs = _documents(shop_base)
    replaced = [doc for doc in current_docs if doc.get("kind") in {kind.value for kind in kinds}]
    kept = [doc for doc in current_docs if doc not in replaced]
    if len(kept) + len(files) > MAX_DOCUMENTS:
        raise HTTPException(
            status_code=400,
            detail=f"A shop can have at most {MAX_DOCUMENTS} documents",
        )

    # Сначала проверяются все файлы, и только потом что-то пишется на диск:
    # иначе при отказе на третьем файле первые два оставались сиротами.
    checked: list[tuple[UploadFile, DocumentKind, str, bytes, str]] = []
    for file, kind in zip(files, kinds):
        # Читается на байт больше предела: этого хватает, чтобы понять, что
        # файл слишком велик, не держа в памяти его целиком.
        contents = await file.read(MAX_DOCUMENT_SIZE + 1)
        if len(contents) > MAX_DOCUMENT_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"Document is too large, limit is {MAX_DOCUMENT_SIZE // (1024 * 1024)} MB",
            )
        # Антивирус смотрит файл раньше проверки формата: зловред, названный
        # passport.pdf, должен отвергаться как зловред и попадать в журнал, а
        # не как «это не PDF» — по второму сообщению никто не узнает, что
        # кто-то прислал заражённый файл.
        scan = await scan_document(contents, file.filename or "document")
        suffix = _check_document(file, contents)
        checked.append((file, kind, suffix, contents, scan.value))

    now = datetime.now(timezone.utc).isoformat()
    new_docs = []
    for file, kind, suffix, contents, scan in checked:
        # Имя приходит от клиента, поэтому в путь идёт только расширение:
        # раньше оно подставлялось целиком, из-за чего документ с совпадающим
        # именем молча затирал предыдущий, а имя с "../" давало 500.
        file_path = f"{UPLOAD_DIR}/{shop_id}_{uuid.uuid4().hex}{suffix}"
        with open(file_path, "wb") as buffer:
            buffer.write(contents)
        new_docs.append({
            "path": file_path,
            "kind": kind.value,
            "original_name": _display_name(file.filename),
            "scan": scan,
            "uploaded_at": now,
        })

    shop_base.documents = kept + new_docs

    await db.commit()
    # Заменённые файлы удаляются после коммита: при неудачной фиксации база
    # ссылалась бы на уже удалённые сканы.
    remove_files([doc["path"] for doc in replaced])
    await db.refresh(shop_base)
    return shop_base
