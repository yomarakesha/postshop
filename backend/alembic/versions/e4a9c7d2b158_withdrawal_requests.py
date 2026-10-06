"""withdrawal requests: FBO seller asks to take goods back from the warehouse

Revision ID: e4a9c7d2b158
Revises: d8e2b4f61a37
Create Date: 2026-10-06
"""

import sqlalchemy as sa
from alembic import op

revision = "e4a9c7d2b158"
down_revision = "d8e2b4f61a37"
branch_labels = None
depends_on = None

OLD = (
    'product_approved', 'product_declined', 'shop_approved', 'shop_rejected',
    'order_status', 'review_approved', 'review_rejected',
    'return_approved', 'return_rejected',
    'order_created', 'order_cancelled', 'receipt_confirmed',
    'review_received', 'return_received', 'shop_blocked',
    'order_shop_rejected', 'product_out_of_stock',
    'product_blocked', 'return_completed', 'order_approved_delivery',
)
NEW = OLD + ('withdrawal_completed', 'withdrawal_rejected')
STATUS = sa.Enum('pending', 'completed', 'rejected', 'cancelled', name='withdrawalstatus')


def upgrade() -> None:
    op.create_table(
        "withdrawal_requests",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("shop_id", sa.Integer(), sa.ForeignKey("shop_bases.id", ondelete="CASCADE"), nullable=False),
        sa.Column("status", STATUS, nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("resolution_comment", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_withdrawal_requests_id", "withdrawal_requests", ["id"])
    op.create_index("ix_withdrawal_requests_shop_id", "withdrawal_requests", ["shop_id"])
    op.create_index("ix_withdrawal_requests_status", "withdrawal_requests", ["status"])
    op.create_table(
        "withdrawal_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("request_id", sa.Integer(), sa.ForeignKey("withdrawal_requests.id", ondelete="CASCADE"), nullable=False),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id", ondelete="CASCADE"), nullable=False),
        sa.Column("measure_unit_id", sa.Integer(), sa.ForeignKey("measure_units.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("quantity", sa.Numeric(12, 3), nullable=False),
    )
    op.create_index("ix_withdrawal_items_id", "withdrawal_items", ["id"])
    op.create_index("ix_withdrawal_items_request_id", "withdrawal_items", ["request_id"])
    op.alter_column(
        'notifications', 'kind',
        existing_type=sa.Enum(*OLD, name='notificationkind'),
        type_=sa.Enum(*NEW, name='notificationkind'),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.execute("DELETE FROM notifications WHERE kind IN ('withdrawal_completed','withdrawal_rejected')")
    op.alter_column(
        'notifications', 'kind',
        existing_type=sa.Enum(*NEW, name='notificationkind'),
        type_=sa.Enum(*OLD, name='notificationkind'),
        existing_nullable=False,
    )
    op.drop_table("withdrawal_items")
    op.drop_table("withdrawal_requests")
