"""add shop notification kinds

Уведомления были только о решениях платформы по товару, магазину, отзыву и
возврату. О событиях самого магазина продавец не узнавал: о новом заказе —
только зайдя и обновив список, о подтверждённой приёмке — никак вообще.

Шесть новых видов. MySQL хранит перечисление списком значений в описании
колонки, поэтому его приходится переобъявлять целиком.

Revision ID: e5b8d3f6a294
Revises: d4a7c2e9f183
Create Date: 2026-08-20 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = 'e5b8d3f6a294'
down_revision: Union[str, Sequence[str], None] = 'd4a7c2e9f183'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

OLD = (
    'product_approved', 'product_declined', 'shop_approved', 'shop_rejected',
    'order_status', 'review_approved', 'review_rejected',
    'return_approved', 'return_rejected',
)
NEW = OLD + (
    'order_created', 'order_cancelled', 'receipt_confirmed',
    'review_received', 'return_received', 'shop_blocked',
)


def upgrade() -> None:
    op.alter_column(
        'notifications', 'kind',
        existing_type=sa.Enum(*OLD, name='notificationkind'),
        type_=sa.Enum(*NEW, name='notificationkind'),
        existing_nullable=False,
    )


def downgrade() -> None:
    # Уведомления новых видов сначала убираем: иначе сузить перечисление
    # нельзя — MySQL обрежет их значения до пустых.
    op.execute(
        "DELETE FROM notifications WHERE kind IN "
        "('order_created','order_cancelled','receipt_confirmed',"
        "'review_received','return_received','shop_blocked')"
    )
    op.alter_column(
        'notifications', 'kind',
        existing_type=sa.Enum(*NEW, name='notificationkind'),
        type_=sa.Enum(*OLD, name='notificationkind'),
        existing_nullable=False,
    )
