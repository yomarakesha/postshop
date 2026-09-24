"""require warehouse type

Складской учёт был отключён двумя независимыми способами. Первый — флаг
FBS_ENABLED=false. Второй, менее заметный: warehouse_type заполнен лишь у 3
магазинов из 14, а снимок в заказе копировал NULL, после чего списание
пропускалось вовсе — на 245 товаров в журнале была одна строка. Включение
флага само по себе ничего не изменило бы для 11 магазинов из 14.

Незаполненный тип трактуется как fbo: сегодня и NULL, и fbo ведут себя
одинаково — расход не списывается. Так поведение существующих магазинов не
меняется, а работа по остатку остаётся осознанным выбором владельца.

Revision ID: e6b3f9d4a172
Revises: d5f8a2c1e460
Create Date: 2026-08-18 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e6b3f9d4a172'
down_revision: Union[str, Sequence[str], None] = 'd5f8a2c1e460'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("UPDATE shop_additionals SET warehouse_type='fbo' WHERE warehouse_type IS NULL")
    op.alter_column(
        "shop_additionals",
        "warehouse_type",
        existing_type=sa.Enum("fbs", "fbo", name="warehousetype"),
        nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "shop_additionals",
        "warehouse_type",
        existing_type=sa.Enum("fbs", "fbo", name="warehousetype"),
        nullable=True,
    )
