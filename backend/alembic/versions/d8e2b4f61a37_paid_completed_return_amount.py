"""paid_at, completed_at, return amount, order_approved_delivery kind

Решения по аудиту 05.10:
- orders.paid_at — отметку «Оплачен» ставит оператор, завершить неоплаченный
  заказ нельзя. Уже завершённые заказы считаем оплаченными: иначе их
  статистика и возвраты разошлись бы с тем, что было на деле.
- orders.completed_at — от неё считается срок возврата (14 дней). Даты
  завершения не было; для уже завершённых берём updated_at.
- return_requests.amount — сумма к возврату (цена на момент заказа ×
  количество): на неё уменьшается выручка магазина.
- order_approved_delivery — заказ с доставкой подтверждён: покупатель видит
  цену доставки и итог и может отменить заказ, если не согласен.

Revision ID: d8e2b4f61a37
Revises: c3f7a1d9e284
Create Date: 2026-10-05
"""

import sqlalchemy as sa
from alembic import op

revision = "d8e2b4f61a37"
down_revision = "c3f7a1d9e284"
branch_labels = None
depends_on = None

OLD = (
    'product_approved', 'product_declined', 'shop_approved', 'shop_rejected',
    'order_status', 'review_approved', 'review_rejected',
    'return_approved', 'return_rejected',
    'order_created', 'order_cancelled', 'receipt_confirmed',
    'review_received', 'return_received', 'shop_blocked',
    'order_shop_rejected', 'product_out_of_stock',
    'product_blocked', 'return_completed',
)
NEW = OLD + ('order_approved_delivery',)


def upgrade() -> None:
    op.add_column("orders", sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("orders", sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True))
    op.execute(
        "UPDATE orders o JOIN order_statuses s ON s.id = o.order_status_id "
        "SET o.completed_at = COALESCE(o.updated_at, o.created_at), "
        "    o.paid_at = COALESCE(o.updated_at, o.created_at) "
        "WHERE s.code = 'completed'"
    )
    op.add_column("return_requests", sa.Column("amount", sa.Numeric(12, 2), nullable=True))
    op.execute(
        "UPDATE return_requests r JOIN order_items i ON i.id = r.order_item_id "
        "SET r.amount = ROUND(i.price_at_order * r.quantity, 2)"
    )
    op.alter_column(
        'notifications', 'kind',
        existing_type=sa.Enum(*OLD, name='notificationkind'),
        type_=sa.Enum(*NEW, name='notificationkind'),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.execute("DELETE FROM notifications WHERE kind = 'order_approved_delivery'")
    op.alter_column(
        'notifications', 'kind',
        existing_type=sa.Enum(*NEW, name='notificationkind'),
        type_=sa.Enum(*OLD, name='notificationkind'),
        existing_nullable=False,
    )
    op.drop_column("return_requests", "amount")
    op.drop_column("orders", "completed_at")
    op.drop_column("orders", "paid_at")
