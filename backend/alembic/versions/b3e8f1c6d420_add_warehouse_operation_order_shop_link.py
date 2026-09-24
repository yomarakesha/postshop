"""add warehouse_operations.order_shop_id link

Списание FBO-заказа пишется в журнал склада платформы. Чтобы не списать одну
часть заказа дважды и чтобы возврат вернулся на тот склад, с которого товар
ушёл, операция связывается с частью заказа — так же, как в журнале FBS.

Revision ID: b3e8f1c6d420
Revises: a1c9e4f7b268
Create Date: 2026-09-17 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b3e8f1c6d420'
down_revision: Union[str, Sequence[str], None] = 'a1c9e4f7b268'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # NULL для приёмок и ручных операций, заполняется для списаний по заказу.
    op.add_column('warehouse_operations', sa.Column('order_shop_id', sa.Integer(), nullable=True))
    op.create_index(op.f('ix_warehouse_operations_order_shop_id'), 'warehouse_operations', ['order_shop_id'], unique=False)
    op.create_foreign_key(
        'fk_warehouse_operations_order_shop_id', 'warehouse_operations', 'order_shops',
        ['order_shop_id'], ['id'], ondelete='SET NULL',
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Индекс не удаляется отдельно: MySQL не даёт удалить индекс, на который
    # опирается внешний ключ, а вместе с колонкой он уходит сам.
    op.drop_constraint('fk_warehouse_operations_order_shop_id', 'warehouse_operations', type_='foreignkey')
    op.drop_column('warehouse_operations', 'order_shop_id')
