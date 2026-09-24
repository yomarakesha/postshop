"""add stock_operations.order_shop_id link

Revision ID: e7f0a9c3b512
Revises: d4b7c1a2e9f3
Create Date: 2026-07-04 00:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e7f0a9c3b512'
down_revision: Union[str, Sequence[str], None] = 'd4b7c1a2e9f3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Связь операции с частью заказа: NULL для ручных операций, заполняется для
    # авто-списаний sold. Аддитивная nullable-колонка — старые операции валидны.
    op.add_column('stock_operations', sa.Column('order_shop_id', sa.Integer(), nullable=True))
    op.create_index(op.f('ix_stock_operations_order_shop_id'), 'stock_operations', ['order_shop_id'], unique=False)
    op.create_foreign_key(
        'fk_stock_operations_order_shop_id', 'stock_operations', 'order_shops',
        ['order_shop_id'], ['id'], ondelete='SET NULL',
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('fk_stock_operations_order_shop_id', 'stock_operations', type_='foreignkey')
    op.drop_index(op.f('ix_stock_operations_order_shop_id'), table_name='stock_operations')
    op.drop_column('stock_operations', 'order_shop_id')
