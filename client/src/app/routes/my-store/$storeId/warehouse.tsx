import { createFileRoute } from '@tanstack/react-router'
import type { WarehouseTab } from '#/pages/my-store-warehouse'
import { RequireFbo } from '#/shared/lib/requireFbo'
import { StoreWarehousePage } from '#/pages/my-store-warehouse'

export const Route = createFileRoute('/my-store/$storeId/warehouse')({
  // Уведомление «приёмка подтверждена» ведёт сразу на документы отправки.
  validateSearch: (search: Record<string, unknown>): { tab: WarehouseTab } => ({
    tab: search.tab === 'shipments' ? 'shipments' : 'stock',
  }),
  // Страница доступна по прямой ссылке даже когда пункт скрыт из меню —
  // поэтому проверка стоит и здесь.
  component: () => (
    <RequireFbo>
      <StoreWarehousePage />
    </RequireFbo>
  ),
})
