import { createFileRoute } from '@tanstack/react-router'
import { StoreIntakePage } from '#/pages/my-store-intake'

export const Route = createFileRoute('/my-store/$storeId/intake')({
  component: StoreIntakePage,
})
