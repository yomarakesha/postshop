import { createFileRoute } from '@tanstack/react-router'
import { MyStoreReturnsPage } from '#/pages/my-store-returns'

export const Route = createFileRoute('/my-store/$storeId/returns')({
  component: MyStoreReturnsPage,
})
