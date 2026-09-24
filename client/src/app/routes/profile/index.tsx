import { createFileRoute } from '@tanstack/react-router'
import { OrdersPage } from '#/pages/my-order'

export const Route = createFileRoute('/profile/')({
  component: OrdersPage,
})
