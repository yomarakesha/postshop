"""add reviews and rating aggregates

Отзывов и оценок не было вовсе: покупатель не мог сказать ничего о покупке, а
у товара и магазина не было репутации.

Отзыв привязан к купленной позиции (order_item_id): это доказательство
покупки. Без него оценки ставил бы кто угодно кому угодно, и рейтинг ничего не
значил бы. Один отзыв на товар от одного человека — купив повторно, второго
голоса не получают.

Агрегаты (rating_avg, rating_count) лежат в товаре и магазине, а не считаются
на каждой выдаче: товары отдаются десятком методов (каталог, поиск, похожие,
подборки, свои товары), и подзапрос пришлось бы добавить в каждый. Считаются
они полным пересчётом из подтверждённых отзывов, поэтому разъехаться не могут.

Права: reviews:create выдаётся покупателям (у кого есть orders:create),
reviews:moderate — только сотрудникам, руками.

Revision ID: b2e5f8a3d691
Revises: a1d4e7b2c580
Create Date: 2026-08-20 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = 'b2e5f8a3d691'
down_revision: Union[str, Sequence[str], None] = 'a1d4e7b2c580'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'reviews',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('order_item_id', sa.Integer(), nullable=False),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('text', sa.Text(), nullable=True),
        sa.Column(
            'status',
            sa.Enum('pending', 'approved', 'rejected', name='reviewstatus'),
            nullable=False,
            server_default='pending',
        ),
        sa.Column('moderation_comment', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        # Отзыв без автора, товара или покупки не значит ничего и никому не
        # показывается — уходит вместе с ними.
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['order_item_id'], ['order_items.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'product_id', name='uq_review_user_product'),
        sa.CheckConstraint('rating BETWEEN 1 AND 5', name='ck_review_rating_range'),
    )
    op.create_index(op.f('ix_reviews_id'), 'reviews', ['id'])
    op.create_index(op.f('ix_reviews_user_id'), 'reviews', ['user_id'])
    op.create_index(op.f('ix_reviews_product_id'), 'reviews', ['product_id'])
    op.create_index(op.f('ix_reviews_status'), 'reviews', ['status'])

    for table in ('products', 'shop_bases'):
        op.add_column(table, sa.Column('rating_avg', sa.Numeric(3, 2), nullable=True))
        op.add_column(
            table,
            sa.Column('rating_count', sa.Integer(), nullable=False, server_default='0'),
        )

    op.execute(
        """
        INSERT INTO permissions (code, description)
        SELECT 'reviews:create', 'Leave a review for a purchased product'
        WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'reviews:create')
        """
    )
    op.execute(
        """
        INSERT INTO permissions (code, description)
        SELECT 'reviews:moderate', 'Approve / reject / remove reviews'
        WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'reviews:moderate')
        """
    )
    # reviews:create — покупателям. reviews:moderate не выдаём никому: это
    # признак сотрудника платформы, и раздать его автоматически значило бы
    # отдать модерацию витрины всем подряд.
    op.execute(
        """
        INSERT INTO user_permissions (user_id, permission_id)
        SELECT existing.user_id, target.id
        FROM user_permissions AS existing
        JOIN permissions AS source ON source.id = existing.permission_id
        JOIN permissions AS target ON target.code = 'reviews:create'
        WHERE source.code = 'orders:create'
          AND NOT EXISTS (
              SELECT 1 FROM user_permissions AS already
              WHERE already.user_id = existing.user_id
                AND already.permission_id = target.id
          )
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DELETE up FROM user_permissions AS up
        JOIN permissions AS target ON target.id = up.permission_id
        WHERE target.code IN ('reviews:create', 'reviews:moderate')
        """
    )
    op.execute("DELETE FROM permissions WHERE code IN ('reviews:create', 'reviews:moderate')")

    for table in ('products', 'shop_bases'):
        op.drop_column(table, 'rating_count')
        op.drop_column(table, 'rating_avg')

    # Индексы отдельно не удаляем: часть из них держат внешние ключи, и MySQL
    # их не отдаёт. drop_table уносит всё.
    op.drop_table('reviews')
