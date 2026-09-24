"""grant warehouses read to sellers

Продавец не мог получить список складов: GET /warehouses/ требует
warehouses:read, а в наборе прав нового пользователя его не было. Без списка
нельзя создать приход — в нём указывается склад, — то есть экран приходов был
бы недоступен даже при наличии всех остальных прав.

Право добавлено в набор новых пользователей, но существующим оно так не
достанется: набор выдаётся один раз при регистрации. Здесь оно выдаётся всем,
у кого уже есть stock_receipts:create — это ровно те, кто может создавать
приходы.

Revision ID: f7c2e8b5d391
Revises: e6b3f9d4a172
Create Date: 2026-08-18 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


revision: str = 'f7c2e8b5d391'
down_revision: Union[str, Sequence[str], None] = 'e6b3f9d4a172'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        INSERT INTO user_permissions (user_id, permission_id)
        SELECT existing.user_id, target.id
        FROM user_permissions AS existing
        JOIN permissions AS source ON source.id = existing.permission_id
        JOIN permissions AS target ON target.code = 'warehouses:read'
        WHERE source.code = 'stock_receipts:create'
          AND NOT EXISTS (
              SELECT 1 FROM user_permissions AS already
              WHERE already.user_id = existing.user_id
                AND already.permission_id = target.id
          )
        """
    )


def downgrade() -> None:
    # Снимаем только у тех, кому выдали здесь: у сотрудников платформы это
    # право своё, и забирать его нельзя.
    op.execute(
        """
        DELETE up FROM user_permissions AS up
        JOIN permissions AS target ON target.id = up.permission_id
        WHERE target.code = 'warehouses:read'
          AND EXISTS (
              SELECT 1 FROM user_permissions AS seller
              JOIN permissions AS source ON source.id = seller.permission_id
              WHERE seller.user_id = up.user_id AND source.code = 'stock_receipts:create'
          )
          AND NOT EXISTS (
              SELECT 1 FROM user_permissions AS staff
              JOIN permissions AS staff_perm ON staff_perm.id = staff.permission_id
              WHERE staff.user_id = up.user_id AND staff_perm.code = 'users:read'
          )
        """
    )
