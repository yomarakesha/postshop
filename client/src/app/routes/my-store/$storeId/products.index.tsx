import { createFileRoute } from '@tanstack/react-router'
import { ProductsPage } from '#/pages/my-store-products'

export const Route = createFileRoute('/my-store/$storeId/products/')({
  // Уведомление «товар закончился» ведёт сразу на свой товар: список длинный
  // и подгружается частями, поэтому нужный товар надо назвать по имени.
  validateSearch: (search: Record<string, unknown>): { product?: number } => {
    const product = Number(search.product)
    return Number.isInteger(product) && product > 0 ? { product } : {}
  },
  component: ProductsPage,
})
