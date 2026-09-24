import { createFileRoute } from '@tanstack/react-router'
import { OrdersPage } from '#/pages/my-store-orders'

export const Route = createFileRoute('/my-store/$storeId/orders')({
  component: OrdersPage,
})
