"""add shop registration comment

У заявки на магазин не было поля для комментария модератора: заявку
отклоняли, а владелец не узнавал причину — после подачи наступала тишина.
У товара такое поле есть (products.moderation_comment), у магазина не было.

Revision ID: d5f8a2c1e460
Revises: c4a7d2e9b381
Create Date: 2026-08-18 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd5f8a2c1e460'
down_revision: Union[str, Sequence[str], None] = 'c4a7d2e9b381'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "shop_bases",
        sa.Column("registration_comment", sa.String(length=1000), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("shop_bases", "registration_comment")
