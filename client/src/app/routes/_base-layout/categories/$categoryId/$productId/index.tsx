import { createFileRoute } from '@tanstack/react-router'
import { requireNumericParams } from '#/shared/lib/requireNumericParams'
import { ProductIdPage } from '#/pages/product-id'

const CategoryProductPage = () => {
  const { productId } = Route.useParams()

  return <ProductIdPage productId={productId} />
}

export const Route = createFileRoute('/_base-layout/categories/$categoryId/$productId/')({
  component: CategoryProductPage,
  beforeLoad: ({ params }) => requireNumericParams(params, ['categoryId', 'productId']),
})
