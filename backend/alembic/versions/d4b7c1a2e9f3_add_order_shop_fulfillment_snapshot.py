"""add order_shops fulfillment snapshot (warehouse_type, warehouse_id)

Revision ID: d4b7c1a2e9f3
Revises: c3a9e1f5b820
Create Date: 2026-07-04 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd4b7c1a2e9f3'
down_revision: Union[str, Sequence[str], None] = 'c3a9e1f5b820'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Снимок способа фулфилмента магазина на момент оформления заказа.
    # Обе колонки nullable и аддитивные — существующее поведение не меняется.
    op.add_column(
        'order_shops',
        sa.Column(
            'warehouse_type',
            sa.Enum('fbs', 'fbo', name='warehousetype'),
            nullable=True,
        ),
    )
    # Задел под FBO: с какого склада платформы обслуживается часть заказа.
    op.add_column('order_shops', sa.Column('warehouse_id', sa.Integer(), nullable=True))
    op.create_index(op.f('ix_order_shops_warehouse_id'), 'order_shops', ['warehouse_id'], unique=False)
    op.create_foreign_key(
        'fk_order_shops_warehouse_id', 'order_shops', 'warehouses',
        ['warehouse_id'], ['id'], ondelete='SET NULL',
    )

    # Бэкфилл: проставляем существующим суб-заказам текущий тип их магазина.
    # Магазины без записи shop_additionals (или с NULL-типом) остаются NULL —
    # к таким частям складская логика не применяется.
    op.execute("""
        UPDATE order_shops os
        JOIN shop_additionals sa ON sa.shop_base_id = os.shop_base_id
        SET os.warehouse_type = sa.warehouse_type
    """)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('fk_order_shops_warehouse_id', 'order_shops', type_='foreignkey')
    op.drop_index(op.f('ix_order_shops_warehouse_id'), table_name='order_shops')
    op.drop_column('order_shops', 'warehouse_id')
    op.drop_column('order_shops', 'warehouse_type')
