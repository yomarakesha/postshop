import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/my-store/$storeId/products')({
  component: () => <Outlet />,
})
