"""Возврат получен назад: когда и вернули ли товар в продажу.

Revision ID: b4e8f2a6c913
Revises: a7d3c9e1f482
Create Date: 2026-10-01
"""

import sqlalchemy as sa
from alembic import op

revision = "b4e8f2a6c913"
down_revision = "a7d3c9e1f482"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("return_requests", sa.Column("received_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("return_requests", sa.Column("restocked", sa.Boolean(), nullable=True))
    # Уже одобренные возвраты по прежнему правилу вернули товар в остаток при
    # одобрении — отмечаем их полученными, иначе их «получили» бы второй раз.
    op.execute(
        "UPDATE return_requests SET received_at = COALESCE(updated_at, created_at), restocked = 1 "
        "WHERE status = 'approved'"
    )


def downgrade() -> None:
    op.drop_column("return_requests", "restocked")
    op.drop_column("return_requests", "received_at")
