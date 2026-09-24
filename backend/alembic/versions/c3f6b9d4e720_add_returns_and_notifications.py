"""add returns and notifications

Два пробела, закрываемых вместе, потому что решение по возврату надо сообщить.

Возврата не было вовсе: в журнале склада существовал тип операции
return_from_customer, но завести его было нечем — ни заявки, ни решения по ней.
Товар физически возвращали, а в системе он оставался проданным.

Уведомлений не было тоже: товар отклоняли, заявку на магазин отклоняли, статус
заказа менялся — узнать об этом можно было только зайдя и проверив вручную.
Причина отказа лежала в базе, но до человека не доходила.

В уведомлении хранится вид события, а не готовый текст: витрина работает на
четырёх языках, и текст в базе был бы всегда на том языке, что был выбран в
момент события, а не на том, на котором человек читает.

Права returns:create выдаётся покупателям (у кого есть orders:create),
returns:manage — только сотрудникам, руками.

Revision ID: c3f6b9d4e720
Revises: b2e5f8a3d691
Create Date: 2026-08-20 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = 'c3f6b9d4e720'
down_revision: Union[str, Sequence[str], None] = 'b2e5f8a3d691'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

NOTIFICATION_KINDS = (
    'product_approved',
    'product_declined',
    'shop_approved',
    'shop_rejected',
    'order_status',
    'review_approved',
    'review_rejected',
    'return_approved',
    'return_rejected',
)


def upgrade() -> None:
    op.create_table(
        'return_requests',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('order_item_id', sa.Integer(), nullable=False),
        sa.Column('quantity', sa.Numeric(12, 3), nullable=False),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column(
            'status',
            sa.Enum('pending', 'approved', 'rejected', name='returnstatus'),
            nullable=False,
            server_default='pending',
        ),
        sa.Column('resolution_comment', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['order_item_id'], ['order_items.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_return_requests_id'), 'return_requests', ['id'])
    op.create_index(op.f('ix_return_requests_user_id'), 'return_requests', ['user_id'])
    op.create_index(op.f('ix_return_requests_order_item_id'), 'return_requests', ['order_item_id'])
    op.create_index(op.f('ix_return_requests_status'), 'return_requests', ['status'])

    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('kind', sa.Enum(*NOTIFICATION_KINDS, name='notificationkind'), nullable=False),
        # Ссылка на объект — просто число: виды указывают на разные таблицы, и
        # одного внешнего ключа на все сразу не бывает. Удаление объекта
        # оставляет уведомление о прошедшем событии, и это правильно —
        # уведомление есть запись истории.
        sa.Column('entity_id', sa.Integer(), nullable=True),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default=sa.text('0')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_notifications_id'), 'notifications', ['id'])
    op.create_index(op.f('ix_notifications_user_id'), 'notifications', ['user_id'])
    op.create_index(op.f('ix_notifications_is_read'), 'notifications', ['is_read'])

    for code, description in (
        ('returns:create', 'Request a return for a purchased item'),
        ('returns:manage', 'Approve / reject return requests'),
    ):
        op.execute(
            f"""
            INSERT INTO permissions (code, description)
            SELECT '{code}', '{description}'
            WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = '{code}')
            """
        )

    op.execute(
        """
        INSERT INTO user_permissions (user_id, permission_id)
        SELECT existing.user_id, target.id
        FROM user_permissions AS existing
        JOIN permissions AS source ON source.id = existing.permission_id
        JOIN permissions AS target ON target.code = 'returns:create'
        WHERE source.code = 'orders:create'
          AND NOT EXISTS (
              SELECT 1 FROM user_permissions AS already
              WHERE already.user_id = existing.user_id
                AND already.permission_id = target.id
          )
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DELETE up FROM user_permissions AS up
        JOIN permissions AS target ON target.id = up.permission_id
        WHERE target.code IN ('returns:create', 'returns:manage')
        """
    )
    op.execute("DELETE FROM permissions WHERE code IN ('returns:create', 'returns:manage')")
    # Индексы отдельно не удаляем: часть держат внешние ключи, MySQL их не
    # отдаёт. drop_table уносит всё.
    op.drop_table('notifications')
    op.drop_table('return_requests')
