from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.sql import func

from app.database import get_db
from app.models.notification import NotificationKind
from app.services.notifications import notify_shop_owner
from app.core.pagination import limit_param, paginate, skip_param
from app.models.stock_receipt import StockReceipt, StockReceiptItem, ReceiptStatus
from app.models.warehouse_operation import WarehouseOperation, WarehouseOperationType
from app.models.shop_base import ShopBase
from app.models.warehouse import Warehouse
from app.models.product import Product
from app.models.measure_unit import MeasureUnit
from app.models.user import User
from app.models.shop_additional import ShopAdditional, WarehouseType
from app.models.product_translation import ProductTranslation
from app.schemas.stock_receipt import (
    StockReceiptCreate,
    StockReceiptItemCreate,
    StockReceiptItemUpdate,
    StockReceiptResponse,
    StockReceiptItemResponse,
)
from app.core.dependencies import require_permissions
from app.core.ownership import STAFF_STOCK, is_staff
from app.core.permissions import Perm
from app.services.stock import ensure_product_unit

router = APIRouter()

RECEIPT_LOAD = [
    selectinload(StockReceipt.shop).selectinload(ShopBase.additional),
    selectinload(StockReceipt.warehouse),
    selectinload(StockReceipt.items).selectinload(StockReceiptItem.measure_unit),
    selectinload(StockReceipt.items).selectinload(StockReceiptItem.product).selectinload(Product.translations),
]


def _build_receipt_response(receipt: StockReceipt, lang: str) -> dict:
    shop_name = receipt.shop.additional.name if receipt.shop and receipt.shop.additional else None
    warehouse_name = receipt.warehouse.name if receipt.warehouse else None

    items = []
    for item in receipt.items:
        translation = next((t for t in item.product.translations if t.language == lang), None)
        items.append({
            "id": item.id,
            "product_id": item.product_id,
            "measure_unit": {"id": item.measure_unit.id, "code": item.measure_unit.code},
            "quantity": item.quantity,
            "product_name": translation.name if translation else None,
        })

    return {
        "id": receipt.id,
        "shop_id": receipt.shop_id,
        "warehouse_id": receipt.warehouse_id,
        "status": receipt.status,
        "created_at": receipt.created_at,
        "confirmed_at": receipt.confirmed_at,
        "items": items,
        "shop_name": shop_name,
        "warehouse_name": warehouse_name,
    }


async def _get_user_shop_ids(user: User, db: AsyncSession) -> list[int]:
    """Идентификаторы магазинов пользователя.

    Раньше здесь стоял scalar_one_or_none(), который падает с
    MultipleResultsFound, если магазинов больше одного — и запрос завершался
    HTTP 500. Несколько магазинов у одного владельца системой предусмотрены:
    /auth/me возвращает именно список.
    """
    result = await db.execute(select(ShopBase.id).where(ShopBase.owner_id == user.id))
    return list(result.scalars().all())


async def _get_receipt_or_404(receipt_id: int, db: AsyncSession) -> StockReceipt:
    result = await db.execute(
        select(StockReceipt).options(*RECEIPT_LOAD).where(StockReceipt.id == receipt_id)
    )
    receipt = result.scalar_one_or_none()
    if not receipt:
        raise HTTPException(status_code=404, detail="Stock receipt not found")
    return receipt


async def _check_receipt_access(
    receipt: StockReceipt, user_shop_ids: list[int], user: User
) -> None:
    """Приход доступен владельцу магазина и сотруднику платформы.

    Раньше условие начиналось с `if user_shop_ids and ...`, то есть у
    пользователя без магазинов проверка не выполнялась вовсе — покупатель читал
    чужие приходы, создавал их для любого магазина и правил чужие черновики.
    """
    if is_staff(user, *STAFF_STOCK):
        return
    if receipt.shop_id not in user_shop_ids:
        raise HTTPException(status_code=403, detail="Access denied")


async def _get_draft_or_404(
    receipt_id: int, db: AsyncSession, *, lock: bool = False
) -> StockReceipt:
    """
    Черновик прихода. С lock=True строка блокируется до проверки статуса.

    Статус читался без блокировки, поэтому два одновременных подтверждения
    проходили проверку «ещё черновик» и оприходовали приход дважды.
    """
    if lock:
        await db.execute(
            select(StockReceipt.id).where(StockReceipt.id == receipt_id).with_for_update()
        )
    receipt = await _get_receipt_or_404(receipt_id, db)
    if receipt.status != ReceiptStatus.draft:
        raise HTTPException(status_code=400, detail="Receipt is already confirmed")
    return receipt


async def _ensure_fbo_shop(shop_id: int, db: AsyncSession) -> None:
    """Приёмка на склад платформы — только для магазина FBO.

    Магазин FBS хранит товар у себя и остаток ведёт сам. Раньше приёмку мог
    завести любой магазин: подтверждённый приход ложился на склад платформы,
    а заказы FBS проверяются по журналу магазина — товар «на складе» ни на что
    не влиял, и платформа принимала на хранение то, что не продаёт.
    """
    warehouse_type = (await db.execute(
        select(ShopAdditional.warehouse_type).where(ShopAdditional.shop_base_id == shop_id)
    )).scalar_one_or_none()
    if warehouse_type != WarehouseType.fbo:
        raise HTTPException(
            status_code=409,
            detail="Stock receipts are for FBO shops only. "
                   "FBS shops keep their own stock (stock operations).",
        )


async def _get_warehouse_or_404(warehouse_id: int, db: AsyncSession) -> Warehouse:
    result = await db.execute(select(Warehouse).where(Warehouse.id == warehouse_id))
    warehouse = result.scalar_one_or_none()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return warehouse


async def _get_product_or_404(product_id: int, db: AsyncSession) -> Product:
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


async def _get_measure_unit_or_404(measure_unit_id: int, db: AsyncSession) -> MeasureUnit:
    result = await db.execute(select(MeasureUnit).where(MeasureUnit.id == measure_unit_id))
    unit = result.scalar_one_or_none()
    if not unit:
        raise HTTPException(status_code=404, detail="Measure unit not found")
    return unit


@router.get("/", response_model=list[StockReceiptResponse])
async def list_receipts(
    warehouse_id: int | None = Query(None),
    shop_id: int | None = Query(None),
    receipt_status: ReceiptStatus | None = Query(None, alias="status"),
    lang: str = Query("ru"),
    response: Response = None,  # type: ignore[assignment]
    skip: int = skip_param(),
    limit: int = limit_param(20),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.STOCK_RECEIPTS_READ)),
):
    user_shop_ids = await _get_user_shop_ids(current_user, db)

    query = select(StockReceipt).options(*RECEIPT_LOAD)

    # Сотрудник видит все приходы, владелец — только своих магазинов. Пустой
    # список магазинов раньше означал «показать все», теперь — «ничего».
    if not is_staff(current_user, *STAFF_STOCK):
        query = query.where(StockReceipt.shop_id.in_(user_shop_ids or [-1]))
    else:
        if shop_id is not None:
            query = query.where(StockReceipt.shop_id == shop_id)
        if warehouse_id is not None:
            query = query.where(StockReceipt.warehouse_id == warehouse_id)

    if receipt_status is not None:
        query = query.where(StockReceipt.status == receipt_status)

    query = await paginate(
        db,
        response,
        query.order_by(StockReceipt.created_at.desc()),
        skip=skip,
        limit=limit,
    )
    result = await db.execute(query)
    receipts = result.scalars().all()
    return [StockReceiptResponse.model_validate(_build_receipt_response(r, lang)) for r in receipts]


@router.post("/", response_model=StockReceiptResponse, status_code=status.HTTP_201_CREATED)
async def create_receipt(
    payload: StockReceiptCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.STOCK_RECEIPTS_CREATE)),
):
    user_shop_ids = await _get_user_shop_ids(current_user, db)
    if not is_staff(current_user, *STAFF_STOCK) and payload.shop_id not in user_shop_ids:
        raise HTTPException(status_code=403, detail="You can only create receipts for your own shop")

    result = await db.execute(select(ShopBase).where(ShopBase.id == payload.shop_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Shop not found")
    await _ensure_fbo_shop(payload.shop_id, db)
    await _get_warehouse_or_404(payload.warehouse_id, db)

    receipt = StockReceipt(shop_id=payload.shop_id, warehouse_id=payload.warehouse_id)
    db.add(receipt)
    await db.commit()
    return await _get_receipt_or_404(receipt.id, db)


@router.get("/{receipt_id}", response_model=StockReceiptResponse)
async def get_receipt(
    receipt_id: int,
    lang: str = Query("ru"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.STOCK_RECEIPTS_READ)),
):
    receipt = await _get_receipt_or_404(receipt_id, db)
    user_shop_ids = await _get_user_shop_ids(current_user, db)
    await _check_receipt_access(receipt, user_shop_ids, current_user)
    return StockReceiptResponse.model_validate(_build_receipt_response(receipt, lang))


@router.post("/{receipt_id}/items", response_model=StockReceiptItemResponse, status_code=status.HTTP_201_CREATED)
async def add_item(
    receipt_id: int,
    payload: StockReceiptItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.STOCK_RECEIPTS_CREATE)),
):
    receipt = await _get_draft_or_404(receipt_id, db)
    user_shop_ids = await _get_user_shop_ids(current_user, db)
    await _check_receipt_access(receipt, user_shop_ids, current_user)
    await _ensure_fbo_shop(receipt.shop_id, db)

    product = await _get_product_or_404(payload.product_id, db)
    await _get_measure_unit_or_404(payload.measure_unit_id, db)

    # Товар чужого магазина в приходе означал бы, что при подтверждении он
    # оприходуется на склад не своему владельцу.
    if product.shop_base_id != receipt.shop_id:
        raise HTTPException(
            status_code=400,
            detail=f"Product {product.id} does not belong to shop {receipt.shop_id}",
        )
    ensure_product_unit(product, payload.measure_unit_id)

    item = StockReceiptItem(
        receipt_id=receipt_id,
        product_id=payload.product_id,
        measure_unit_id=payload.measure_unit_id,
        quantity=payload.quantity,
    )
    db.add(item)
    await db.commit()

    result = await db.execute(
        select(StockReceiptItem)
        .options(
            selectinload(StockReceiptItem.measure_unit),
            selectinload(StockReceiptItem.product),
        )
        .where(StockReceiptItem.id == item.id)
    )
    return result.scalar_one()


@router.patch("/{receipt_id}/items/{item_id}", response_model=StockReceiptItemResponse)
async def update_item_quantity(
    receipt_id: int,
    item_id: int,
    payload: StockReceiptItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.STOCK_RECEIPTS_CREATE)),
):
    """
    Исправить количество позиции черновика.

    Складчик при приёмке находил расхождение — привезли меньше заявленного, —
    и мог только удалить позицию и завести её заново. Подтверждается то, что
    фактически принято, поэтому количество правится до подтверждения.
    """
    receipt = await _get_draft_or_404(receipt_id, db, lock=True)
    user_shop_ids = await _get_user_shop_ids(current_user, db)
    await _check_receipt_access(receipt, user_shop_ids, current_user)

    item = (await db.execute(
        select(StockReceiptItem).where(
            StockReceiptItem.id == item_id,
            StockReceiptItem.receipt_id == receipt_id,
        )
    )).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    item.quantity = payload.quantity
    await db.commit()

    result = await db.execute(
        select(StockReceiptItem)
        .options(
            selectinload(StockReceiptItem.measure_unit),
            selectinload(StockReceiptItem.product),
        )
        .where(StockReceiptItem.id == item.id)
    )
    return result.scalar_one()


@router.delete("/{receipt_id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    receipt_id: int,
    item_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.STOCK_RECEIPTS_CREATE)),
):
    receipt = await _get_draft_or_404(receipt_id, db)
    user_shop_ids = await _get_user_shop_ids(current_user, db)
    await _check_receipt_access(receipt, user_shop_ids, current_user)

    result = await db.execute(
        select(StockReceiptItem).where(
            StockReceiptItem.id == item_id,
            StockReceiptItem.receipt_id == receipt_id,
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    await db.delete(item)
    await db.commit()


@router.post("/{receipt_id}/cancel", response_model=StockReceiptResponse)
async def cancel_receipt(
    receipt_id: int,
    lang: str = Query("ru"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.STOCK_RECEIPTS_CREATE)),
):
    """
    Отменить черновик прихода.

    Ошибочный черновик некуда было девать: статусов было два, удаления нет, и
    он висел в списке вечно. Отмена оставляет запись в истории, но выводит её
    из работы. Подтверждённый приход не отменяется — он уже оприходован на
    склад, и обратное движение оформляется складской операцией.
    """
    receipt = await _get_draft_or_404(receipt_id, db, lock=True)
    user_shop_ids = await _get_user_shop_ids(current_user, db)
    await _check_receipt_access(receipt, user_shop_ids, current_user)

    receipt.status = ReceiptStatus.cancelled
    await db.commit()

    receipt = await _get_receipt_or_404(receipt_id, db)
    return StockReceiptResponse.model_validate(_build_receipt_response(receipt, lang))


@router.delete("/{receipt_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_receipt(
    receipt_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(Perm.STOCK_RECEIPTS_CREATE)),
):
    """
    Удалить черновик прихода вместе с его позициями.

    Подтверждённый приход удалить нельзя: на него опирается движение по складу.
    """
    receipt = await _get_receipt_or_404(receipt_id, db)
    user_shop_ids = await _get_user_shop_ids(current_user, db)
    await _check_receipt_access(receipt, user_shop_ids, current_user)

    if receipt.status == ReceiptStatus.confirmed:
        raise HTTPException(
            status_code=400,
            detail="Confirmed receipt cannot be deleted: it is already posted to the warehouse",
        )

    for item in list(receipt.items):
        await db.delete(item)
    await db.delete(receipt)
    await db.commit()


@router.post("/{receipt_id}/confirm", response_model=StockReceiptResponse)
async def confirm_receipt(
    receipt_id: int,
    lang: str = Query("ru"),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(
        Perm.STOCK_RECEIPTS_CONFIRM,
        hint="Receipts are confirmed by an administrator: the shop owner creates the receipt "
             "and fills in its items, confirmation is done on the platform side.",
    )),
):
    receipt = await _get_draft_or_404(receipt_id, db, lock=True)
    # Тип магазина мог смениться, пока документ ждал: магазину FBS склад
    # платформы не нужен, и приход туда ни на что бы не повлиял.
    await _ensure_fbo_shop(receipt.shop_id, db)

    if not receipt.items:
        raise HTTPException(status_code=400, detail="Cannot confirm an empty receipt")

    for item in receipt.items:
        db.add(WarehouseOperation(
            warehouse_id=receipt.warehouse_id,
            shop_id=receipt.shop_id,
            product_id=item.product_id,
            measure_unit_id=item.measure_unit_id,
            operation_type=WarehouseOperationType.income,
            quantity=item.quantity,
        ))

    receipt.status = ReceiptStatus.confirmed
    receipt.confirmed_at = func.now()

    # Подтверждает приход платформа, а ждёт его продавец: без уведомления он
    # видел только «Ожидает подтверждения» и не знал, когда товар зачли.
    await notify_shop_owner(
        db,
        shop_base_id=receipt.shop_id,
        kind=NotificationKind.receipt_confirmed,
        entity_id=receipt.id,
    )

    await db.commit()

    receipt = await _get_receipt_or_404(receipt_id, db)
    return StockReceiptResponse.model_validate(_build_receipt_response(receipt, lang))
