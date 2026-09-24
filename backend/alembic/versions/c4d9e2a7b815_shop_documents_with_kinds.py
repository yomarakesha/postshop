"""shop documents: list of objects with kind and antivirus status

Документы магазина хранились списком путей. Теперь каждый — объект
{path, kind, original_name, scan, uploaded_at}: модератор видит, где паспорт,
а где патент, и проверен ли файл антивирусом. Старые пути переводятся в
объекты без вида и с пометкой «не проверен» — узнать задним числом нельзя
ни то, ни другое.

Revision ID: c4d9e2a7b815
Revises: b3e8f1c6d420
Create Date: 2026-09-17 18:30:00.000000

"""
import json
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c4d9e2a7b815'
down_revision: Union[str, Sequence[str], None] = 'b3e8f1c6d420'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _rows(conn):
    return conn.execute(sa.text("SELECT id, documents FROM shop_bases")).fetchall()


def _load(value):
    if value is None:
        return []
    return json.loads(value) if isinstance(value, (str, bytes)) else value


def upgrade() -> None:
    conn = op.get_bind()
    for shop_id, raw in _rows(conn):
        docs = _load(raw)
        converted = [
            doc if isinstance(doc, dict)
            else {"path": doc, "kind": None, "original_name": None,
                  "scan": "not_scanned", "uploaded_at": None}
            for doc in docs
        ]
        if converted != docs:
            conn.execute(
                sa.text("UPDATE shop_bases SET documents = :docs WHERE id = :id"),
                {"docs": json.dumps(converted, ensure_ascii=False), "id": shop_id},
            )


def downgrade() -> None:
    conn = op.get_bind()
    for shop_id, raw in _rows(conn):
        docs = _load(raw)
        paths = [doc["path"] if isinstance(doc, dict) else doc for doc in docs]
        if paths != docs:
            conn.execute(
                sa.text("UPDATE shop_bases SET documents = :docs WHERE id = :id"),
                {"docs": json.dumps(paths, ensure_ascii=False), "id": shop_id},
            )
