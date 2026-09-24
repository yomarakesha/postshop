"""add order_shops (per-shop suborders) and order_items.order_shop_id

Revision ID: b1f4c2a7d9e0
Revises: a5122ee91c6e
Create Date: 2026-06-17 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b1f4c2a7d9e0'
down_revision: Union[str, Sequence[str], None] = 'a5122ee91c6e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Таблица суб-заказов: по одной строке на (заказ × магазин).
    op.create_table(
        'order_shops',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('order_id', sa.Integer(), nullable=False),
        sa.Column('shop_base_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.Enum('pending', 'approved', 'rejected', 'ready_to_take',
                                     name='localorderstatuscode'), nullable=False),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['shop_base_id'], ['shop_bases.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('order_id', 'shop_base_id', name='uq_order_shop'),
    )
    op.create_index(op.f('ix_order_shops_id'), 'order_shops', ['id'], unique=False)
    op.create_index(op.f('ix_order_shops_order_id'), 'order_shops', ['order_id'], unique=False)
    op.create_index(op.f('ix_order_shops_shop_base_id'), 'order_shops', ['shop_base_id'], unique=False)

    # 2. Колонка связи позиции -> суб-заказ (сначала nullable для бэкфилла).
    op.add_column('order_items', sa.Column('order_shop_id', sa.Integer(), nullable=True))

    # 3. Бэкфилл существующих заказов: группируем позиции по магазину товара.
    op.execute("""
        INSERT INTO order_shops (order_id, shop_base_id, status, created_at)
        SELECT oi.order_id, p.shop_base_id, 'pending', NOW()
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        GROUP BY oi.order_id, p.shop_base_id
    """)
    op.execute("""
        UPDATE order_items oi
        JOIN products p ON p.id = oi.product_id
        JOIN order_shops os ON os.order_id = oi.order_id AND os.shop_base_id = p.shop_base_id
        SET oi.order_shop_id = os.id
    """)

    # 4. Делаем колонку обязательной + FK + индекс.
    op.alter_column('order_items', 'order_shop_id', existing_type=sa.Integer(), nullable=False)
    op.create_foreign_key(
        'fk_order_items_order_shop_id', 'order_items', 'order_shops',
        ['order_shop_id'], ['id'], ondelete='CASCADE',
    )
    op.create_index(op.f('ix_order_items_order_shop_id'), 'order_items', ['order_shop_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('fk_order_items_order_shop_id', 'order_items', type_='foreignkey')
    op.drop_index(op.f('ix_order_items_order_shop_id'), table_name='order_items')
    op.drop_column('order_items', 'order_shop_id')

    op.drop_index(op.f('ix_order_shops_shop_base_id'), table_name='order_shops')
    op.drop_index(op.f('ix_order_shops_order_id'), table_name='order_shops')
    op.drop_index(op.f('ix_order_shops_id'), table_name='order_shops')
    op.drop_table('order_shops')
