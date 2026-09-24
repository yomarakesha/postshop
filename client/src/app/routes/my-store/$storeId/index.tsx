import { createFileRoute } from '@tanstack/react-router'
import { DashboardPage } from '#/pages/my-store-dashboard'

export const Route = createFileRoute('/my-store/$storeId/')({
  component: DashboardPage,
})
