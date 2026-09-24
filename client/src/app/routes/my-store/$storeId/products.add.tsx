import { createFileRoute } from '@tanstack/react-router'
import { AddProductPage } from '#/pages/my-store-products-add'

export const Route = createFileRoute('/my-store/$storeId/products/add')({
  component: AddProductPage,
})
