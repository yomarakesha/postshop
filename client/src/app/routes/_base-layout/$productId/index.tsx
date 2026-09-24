import { createFileRoute } from '@tanstack/react-router'
import { requireNumericParams } from '#/shared/lib/requireNumericParams'
import { ProductIdPage } from '#/pages/product-id'

const HomeProductPage = () => {
  const { productId } = Route.useParams()

  return <ProductIdPage productId={productId} />
}

export const Route = createFileRoute('/_base-layout/$productId/')({
  component: HomeProductPage,
  beforeLoad: ({ params }) => requireNumericParams(params, ['productId']),
})
