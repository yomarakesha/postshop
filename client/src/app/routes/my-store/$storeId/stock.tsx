import { createFileRoute } from '@tanstack/react-router'
import { StoreStockPage } from '#/pages/my-store-stock'

export const Route = createFileRoute('/my-store/$storeId/stock')({
  component: StoreStockPage,
})
