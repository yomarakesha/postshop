"""Штрихкоды товара: штрихкод Postshop и заводской штрихкод продавца.

Штрихкод Postshop выдаётся всем уже существующим товарам здесь же, по тому же
правилу, что и новым (app/services/barcode.py): `200` + номер + контрольная.

Revision ID: a7d3c9e1f482
Revises: d4a81b60f3c7
Create Date: 2026-09-30
"""

import sqlalchemy as sa
from alembic import op

revision = "a7d3c9e1f482"
down_revision = "d4a81b60f3c7"
branch_labels = None
depends_on = None


def _ean13(product_id: int) -> str:
    body = f"200{product_id:09d}"
    total = sum(int(d) * (3 if i % 2 else 1) for i, d in enumerate(body))
    return body + str((10 - total % 10) % 10)


def upgrade() -> None:
    op.add_column("products", sa.Column("barcode", sa.String(13), nullable=True))
    op.add_column("products", sa.Column("vendor_barcode", sa.String(14), nullable=True))

    conn = op.get_bind()
    ids = [row[0] for row in conn.execute(sa.text("SELECT id FROM products"))]
    for product_id in ids:
        conn.execute(
            sa.text("UPDATE products SET barcode = :code WHERE id = :id"),
            {"code": _ean13(product_id), "id": product_id},
        )

    op.create_unique_constraint("uq_products_barcode", "products", ["barcode"])
    op.create_unique_constraint(
        "uq_product_shop_vendor_barcode", "products", ["shop_base_id", "vendor_barcode"]
    )


def downgrade() -> None:
    op.drop_constraint("uq_product_shop_vendor_barcode", "products", type_="unique")
    op.drop_constraint("uq_products_barcode", "products", type_="unique")
    op.drop_column("products", "vendor_barcode")
    op.drop_column("products", "barcode")
