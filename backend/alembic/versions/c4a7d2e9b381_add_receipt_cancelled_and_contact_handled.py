"""add receipt cancelled status and contact-us handled flag

Созданное нельзя было ни убрать, ни отключить. Ошибочный черновик прихода
висел в списке вечно: статусов было два (draft, confirmed), удаления нет.
Обращения из формы «Связаться» можно было только читать — ни отметки
«обработано», ни удаления, поэтому оператор перечитывал одни и те же.

Revision ID: c4a7d2e9b381
Revises: b3e6f1a8c245
Create Date: 2026-08-18 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c4a7d2e9b381'
down_revision: Union[str, Sequence[str], None] = 'b3e6f1a8c245'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "stock_receipts",
        "status",
        existing_nullable=False,
        type_=sa.Enum("draft", "confirmed", "cancelled", name="receiptstatus"),
    )
    op.add_column(
        "contact_us",
        sa.Column("is_handled", sa.Boolean(), nullable=False, server_default=sa.text("0")),
    )
    op.add_column("contact_us", sa.Column("handled_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    # Отменённые приходы возвращаются в черновики: иначе значение не влезет
    # в суженный набор и ALTER упадёт.
    op.execute("UPDATE stock_receipts SET status='draft' WHERE status='cancelled'")
    op.alter_column(
        "stock_receipts",
        "status",
        existing_nullable=False,
        type_=sa.Enum("draft", "confirmed", name="receiptstatus"),
    )
    op.drop_column("contact_us", "handled_at")
    op.drop_column("contact_us", "is_handled")
