"""notifications: kind «товар закончился»

Продавец узнавал о закончившемся товаре от покупателя, который уже не смог
его купить: остаток доходил до нуля, а товар оставался в каталоге.

Revision ID: b8d2f51c9a76
Revises: c4d9e2a7b815
Create Date: 2026-09-18 16:40:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = 'b8d2f51c9a76'
down_revision: Union[str, Sequence[str], None] = 'c4d9e2a7b815'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

OLD = (
    'product_approved', 'product_declined', 'shop_approved', 'shop_rejected',
    'order_status', 'review_approved', 'review_rejected',
    'return_approved', 'return_rejected',
    'order_created', 'order_cancelled', 'receipt_confirmed',
    'review_received', 'return_received', 'shop_blocked',
    'order_shop_rejected',
)
NEW = OLD + ('product_out_of_stock',)


def upgrade() -> None:
    op.alter_column(
        'notifications', 'kind',
        existing_type=sa.Enum(*OLD, name='notificationkind'),
        type_=sa.Enum(*NEW, name='notificationkind'),
        existing_nullable=False,
    )


def downgrade() -> None:
    # Уведомления нового вида сначала убираем: иначе сузить перечисление
    # нельзя — MySQL обрежет их значения до пустых.
    op.execute("DELETE FROM notifications WHERE kind = 'product_out_of_stock'")
    op.alter_column(
        'notifications', 'kind',
        existing_type=sa.Enum(*NEW, name='notificationkind'),
        type_=sa.Enum(*OLD, name='notificationkind'),
        existing_nullable=False,
    )
