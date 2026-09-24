import { createFileRoute } from '@tanstack/react-router'
import { RequireFbo } from '#/shared/lib/requireFbo'
import { StoreReceiptsPage } from '#/pages/my-store-receipts'

export const Route = createFileRoute('/my-store/$storeId/receipts')({
  // Страница доступна по прямой ссылке даже когда пункт скрыт из меню —
  // поэтому проверка стоит и здесь.
  component: () => (
    <RequireFbo>
      <StoreReceiptsPage />
    </RequireFbo>
  ),
})
