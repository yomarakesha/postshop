import { createFileRoute } from '@tanstack/react-router'
import { StoreClosePage } from '#/pages/my-store-close'

export const Route = createFileRoute('/my-store/$storeId/close')({
  component: StoreClosePage,
})
