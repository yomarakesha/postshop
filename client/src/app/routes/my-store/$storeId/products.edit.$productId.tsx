import { createFileRoute } from '@tanstack/react-router'
import { EditProductPage } from '#/pages/my-store-products-edit'

export const Route = createFileRoute('/my-store/$storeId/products/edit/$productId')({
  component: EditProductPage,
})
