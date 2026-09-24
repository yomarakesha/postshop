"""add order_shop_rejected notification kind

Магазин отказывается от своей части заказа методом
`PATCH /orders/{id}/shop/{shop_id}/status`, и покупателю об этом не сообщалось
ничего: уведомление отправлял только общий метод смены статуса заказа, а
общий статус при отказе магазина не меняется. Человек оставался с заказом,
который по всем признакам «подтверждён», и узнавал об отказе, только зайдя и
присмотревшись.

Отдельный вид, а не существующий `order_status`, потому что событие другое:
статус заказа при частичном отказе действительно не менялся, и сообщение
«Статус заказа изменился» было бы неправдой.

MySQL хранит перечисление списком значений в описании колонки, поэтому его
приходится переобъявлять целиком.

Revision ID: a1c9e4f7b268
Revises: e5b8d3f6a294
Create Date: 2026-08-25 13:20:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = 'a1c9e4f7b268'
down_revision: Union[str, Sequence[str], None] = 'e5b8d3f6a294'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

OLD = (
    'product_approved', 'product_declined', 'shop_approved', 'shop_rejected',
    'order_status', 'review_approved', 'review_rejected',
    'return_approved', 'return_rejected',
    'order_created', 'order_cancelled', 'receipt_confirmed',
    'review_received', 'return_received', 'shop_blocked',
)
NEW = OLD + ('order_shop_rejected',)


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
    op.execute("DELETE FROM notifications WHERE kind = 'order_shop_rejected'")
    op.alter_column(
        'notifications', 'kind',
        existing_type=sa.Enum(*NEW, name='notificationkind'),
        type_=sa.Enum(*OLD, name='notificationkind'),
        existing_nullable=False,
    )
