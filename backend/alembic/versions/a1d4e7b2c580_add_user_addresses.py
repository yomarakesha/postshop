"""add user addresses

Адрес доставки был свободным текстом в заказе и набирался заново при каждом
оформлении: ни выбрать прежний, ни сохранить новый было нельзя.

Таблица отдельная, а не поле у пользователя: адресов у человека несколько
(дом, работа), и заказ должен хранить адрес на момент покупки — если потом
поправить свой адрес, прошлые заказы меняться не должны.

Права addresses:read и addresses:manage заводятся вместе с таблицей и выдаются
всем, у кого есть cart:manage. Это ровно покупатели: набор прав выдаётся один
раз при регистрации, поэтому существующим пользователям иначе не достался бы.

Revision ID: a1d4e7b2c580
Revises: f7c2e8b5d391
Create Date: 2026-08-20 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = 'a1d4e7b2c580'
down_revision: Union[str, Sequence[str], None] = 'f7c2e8b5d391'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'user_addresses',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=100), nullable=False),
        sa.Column('address', sa.Text(), nullable=False),
        sa.Column('is_default', sa.Boolean(), nullable=False, server_default=sa.text('0')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        # Удаление пользователя забирает его адреса: без владельца адрес не
        # значит ничего и никому не показывается.
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_user_addresses_id'), 'user_addresses', ['id'])
    op.create_index(op.f('ix_user_addresses_user_id'), 'user_addresses', ['user_id'])

    # Права заводим здесь же: seed_permissions добавит их и сам, но порядок
    # шагов деплоя — миграции, потом seed, — и выдача ниже без них не сработает.
    op.execute(
        """
        INSERT INTO permissions (code, description)
        SELECT 'addresses:read', 'View own saved delivery addresses'
        WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'addresses:read')
        """
    )
    op.execute(
        """
        INSERT INTO permissions (code, description)
        SELECT 'addresses:manage', 'Add / update / remove own delivery addresses'
        WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'addresses:manage')
        """
    )

    for code in ('addresses:read', 'addresses:manage'):
        op.execute(
            f"""
            INSERT INTO user_permissions (user_id, permission_id)
            SELECT existing.user_id, target.id
            FROM user_permissions AS existing
            JOIN permissions AS source ON source.id = existing.permission_id
            JOIN permissions AS target ON target.code = '{code}'
            WHERE source.code = 'cart:manage'
              AND NOT EXISTS (
                  SELECT 1 FROM user_permissions AS already
                  WHERE already.user_id = existing.user_id
                    AND already.permission_id = target.id
              )
            """
        )


def downgrade() -> None:
    # Сначала выдачи, потом сами права: иначе внешний ключ не даст удалить.
    op.execute(
        """
        DELETE up FROM user_permissions AS up
        JOIN permissions AS target ON target.id = up.permission_id
        WHERE target.code IN ('addresses:read', 'addresses:manage')
        """
    )
    op.execute("DELETE FROM permissions WHERE code IN ('addresses:read', 'addresses:manage')")
    # Индексы отдельно не удаляем: MySQL не отдаёт индекс, на который опирается
    # внешний ключ, и откат падал на ix_user_addresses_user_id. drop_table
    # уносит и внешний ключ, и оба индекса.
    op.drop_table('user_addresses')
