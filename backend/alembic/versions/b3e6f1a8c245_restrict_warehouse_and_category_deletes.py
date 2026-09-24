"""restrict warehouse and category deletes

Удаление склада стирало весь его складской журнал и приходы, а удаление
категории — все товары в ней вместе с их историей. Всё это молча, каскадом
на уровне базы: одна строка удаляется, за ней уходят сотни, и восстановить
их нечем. Теперь база откажет, если на запись кто-то ссылается.

Ссылки, которые остаются как были:
  * order_shops.warehouse_id — SET NULL: заказ должен переживать удаление
    склада, ссылка на склад в нём справочная;
  * category_translations.category_id — CASCADE: перевод не имеет смысла
    без своей категории, это часть той же записи.

Revision ID: b3e6f1a8c245
Revises: a9d3e5f7c164
Create Date: 2026-08-18 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'b3e6f1a8c245'
down_revision: Union[str, Sequence[str], None] = 'a9d3e5f7c164'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# (таблица, имя ограничения, колонка, целевая таблица)
LINKS = [
    ("warehouse_operations", "warehouse_operations_ibfk_4", "warehouse_id", "warehouses"),
    ("stock_receipts", "stock_receipts_ibfk_2", "warehouse_id", "warehouses"),
    ("products", "products_ibfk_2", "category_id", "categories"),
]


def upgrade() -> None:
    for table, name, column, target in LINKS:
        op.drop_constraint(name, table, type_="foreignkey")
        op.create_foreign_key(
            name, table, target, [column], ["id"], ondelete="RESTRICT"
        )


def downgrade() -> None:
    for table, name, column, target in LINKS:
        op.drop_constraint(name, table, type_="foreignkey")
        op.create_foreign_key(
            name, table, target, [column], ["id"], ondelete="CASCADE"
        )
