"""add product views counter

Самая полезная метрика для продавца — «смотрели 200 раз, купили 3»: сразу
видно, что отпугивает цена или фотография. Посчитать её было нельзя: счётчика
просмотров не существовало ни в каком виде, а задним числом такие данные не
восстанавливаются — поэтому колонка заводится сейчас, показывается позже.

Revision ID: d4a7c2e9f183
Revises: c3f6b9d4e720
Create Date: 2026-08-20 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = 'd4a7c2e9f183'
down_revision: Union[str, Sequence[str], None] = 'c3f6b9d4e720'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'products',
        sa.Column('views_count', sa.Integer(), nullable=False, server_default='0'),
    )


def downgrade() -> None:
    op.drop_column('products', 'views_count')
