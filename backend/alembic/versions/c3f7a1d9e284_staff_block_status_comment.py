"""staff block flag, order status comment, new notification kinds

Блокировку магазина или товара сотрудником владелец снимал сам: права
block/unblock у него есть (свой магазин закрывает и открывает он же), а кто
поставил блок — не хранилось. Флаг blocked_by_staff это различает.

Комментарий заказа был один на всех: покупатель писал пожелание при
оформлении, админ при смене статуса его затирал, отмена покупателем — тоже.
Решение платформы теперь пишется в status_comment, comment остаётся
покупателю.

Новые виды уведомлений: product_blocked (сотрудник снял товар с продажи) и
return_completed (возврат получен — покупателю). MySQL хранит перечисление
списком, поэтому оно переобъявляется целиком.

Revision ID: c3f7a1d9e284
Revises: b4e8f2a6c913
Create Date: 2026-10-05
"""

import sqlalchemy as sa
from alembic import op

revision = "c3f7a1d9e284"
down_revision = "b4e8f2a6c913"
branch_labels = None
depends_on = None

OLD = (
    'product_approved', 'product_declined', 'shop_approved', 'shop_rejected',
    'order_status', 'review_approved', 'review_rejected',
    'return_approved', 'return_rejected',
    'order_created', 'order_cancelled', 'receipt_confirmed',
    'review_received', 'return_received', 'shop_blocked',
    'order_shop_rejected', 'product_out_of_stock',
)
NEW = OLD + ('product_blocked', 'return_completed')

CANCEL_MARKER = "Отменён покупателем"


def upgrade() -> None:
    op.add_column(
        "shop_bases",
        sa.Column("blocked_by_staff", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column(
        "products",
        sa.Column("blocked_by_staff", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column("orders", sa.Column("status_comment", sa.Text(), nullable=True))
    # Отметки отмены, уже записанные в comment, переносим: иначе продавец
    # продолжит видеть их вместо слов покупателя.
    op.execute(
        f"UPDATE orders SET status_comment = comment, comment = NULL "
        f"WHERE comment LIKE '{CANCEL_MARKER}%'"
    )
    op.alter_column(
        'notifications', 'kind',
        existing_type=sa.Enum(*OLD, name='notificationkind'),
        type_=sa.Enum(*NEW, name='notificationkind'),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.execute("DELETE FROM notifications WHERE kind IN ('product_blocked','return_completed')")
    op.alter_column(
        'notifications', 'kind',
        existing_type=sa.Enum(*NEW, name='notificationkind'),
        type_=sa.Enum(*OLD, name='notificationkind'),
        existing_nullable=False,
    )
    op.execute(
        "UPDATE orders SET comment = status_comment "
        "WHERE comment IS NULL AND status_comment IS NOT NULL"
    )
    op.drop_column("orders", "status_comment")
    op.drop_column("products", "blocked_by_staff")
    op.drop_column("shop_bases", "blocked_by_staff")
