"""Магазин в уведомлении продавца

Маршруты кабинета начинаются с идентификатора магазина, а в уведомлении его не
было: у продавца с несколькими магазинами ссылка вела на выбор магазина, и
товар, про который написали, он искал сам.

Старые уведомления о товарах восстанавливаются по самому товару — он знает свой
магазин. Для заказов и приёмок связь уже не восстановить, они остаются как есть.

Revision ID: c5e70a3f1d92
Revises: b8d2f51c9a76
Create Date: 2026-09-18
"""

from alembic import op
import sqlalchemy as sa


revision = "c5e70a3f1d92"
down_revision = "b8d2f51c9a76"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("notifications", sa.Column("shop_base_id", sa.Integer(), nullable=True))
    op.execute(
        """
        UPDATE notifications n
          JOIN products p ON p.id = n.entity_id
           SET n.shop_base_id = p.shop_base_id
         WHERE n.kind IN ('product_approved', 'product_declined', 'product_out_of_stock')
        """
    )


def downgrade() -> None:
    op.drop_column("notifications", "shop_base_id")
