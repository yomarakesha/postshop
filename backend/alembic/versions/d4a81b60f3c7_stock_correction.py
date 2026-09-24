"""Пересчёт остатка отдельным типом операции

Свести пересчитанную полку было нечем: продавец оформлял «приход» там, где
товар нашёлся, и «возврат поставщику» там, где он пропал. Журнал переставал
описывать происходившее. У пересчёта количество со знаком — он и добавляет, и
убавляет.

Revision ID: d4a81b60f3c7
Revises: c5e70a3f1d92
Create Date: 2026-09-18
"""

from alembic import op


revision = "d4a81b60f3c7"
down_revision = "c5e70a3f1d92"
branch_labels = None
depends_on = None

OLD = "'income','return_from_customer','sold','return_to_supplier'"
NEW = OLD + ",'correction'"


def upgrade() -> None:
    op.execute(f"ALTER TABLE stock_operations MODIFY operation_type ENUM({NEW}) NOT NULL")


def downgrade() -> None:
    op.execute("DELETE FROM stock_operations WHERE operation_type = 'correction'")
    op.execute(f"ALTER TABLE stock_operations MODIFY operation_type ENUM({OLD}) NOT NULL")
