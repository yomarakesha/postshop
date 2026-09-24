"""add product moderation status

Revision ID: c3a9e1f5b820
Revises: b1f4c2a7d9e0
Create Date: 2026-06-28 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3a9e1f5b820'
down_revision: Union[str, Sequence[str], None] = 'b1f4c2a7d9e0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Колонка статуса модерации (сначала nullable, чтобы заполнить существующие).
    op.add_column(
        'products',
        sa.Column(
            'status',
            sa.Enum('pending', 'approved', 'declined', name='productstatus'),
            nullable=True,
        ),
    )
    op.add_column('products', sa.Column('moderation_comment', sa.String(length=500), nullable=True))

    # 2. Все существующие товары были добавлены до модерации — считаем их одобренными,
    #    иначе действующий каталог разом исчезнет из выдачи.
    op.execute("UPDATE products SET status = 'approved' WHERE status IS NULL")

    # 3. Делаем колонку обязательной + индекс.
    op.alter_column(
        'products', 'status',
        existing_type=sa.Enum('pending', 'approved', 'declined', name='productstatus'),
        nullable=False,
    )
    op.create_index(op.f('ix_products_status'), 'products', ['status'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_products_status'), table_name='products')
    op.drop_column('products', 'moderation_comment')
    op.drop_column('products', 'status')
