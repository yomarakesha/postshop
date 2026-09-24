"""add orders.delivery_price

Revision ID: a9d3e5f7c164
Revises: f8c1d2b4a730
Create Date: 2026-07-19 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a9d3e5f7c164'
down_revision: Union[str, Sequence[str], None] = 'f8c1d2b4a730'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Цена доставки, назначаемая админом при одобрении заказа (approved).
    # Nullable и аддитивная: NULL — не назначена или самовывоз, существующие
    # заказы не требуют бэкфилла.
    op.add_column('orders', sa.Column('delivery_price', sa.Numeric(10, 2), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('orders', 'delivery_price')
