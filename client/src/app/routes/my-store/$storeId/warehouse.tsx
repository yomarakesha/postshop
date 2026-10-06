import { createFileRoute } from '@tanstack/react-router'
import type { WarehouseTab } from '#/pages/my-store-warehouse'
import { RequireFbo } from '#/shared/lib/requireFbo'
import { StoreWarehousePage } from '#/pages/my-store-warehouse'

export const Route = createFileRoute('/my-store/$storeId/warehouse')({
  // Уведомления ведут сразу на нужную вкладку: «приёмка подтверждена» — на
  // документы отправки, решение по вывозу — на заявки на вывоз.
  validateSearch: (search: Record<string, unknown>): { tab: WarehouseTab } => ({
    tab: search.tab === 'shipments' || search.tab === 'withdrawals' ? search.tab : 'stock',
  }),
  // Страница доступна по прямой ссылке даже когда пункт скрыт из меню —
  // поэтому проверка стоит и здесь.
  component: () => (
    <RequireFbo>
      <StoreWarehousePage />
    </RequireFbo>
  ),
})
