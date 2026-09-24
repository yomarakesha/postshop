import { createFileRoute } from '@tanstack/react-router'
import { requireNumericParams } from '#/shared/lib/requireNumericParams'
import { ProductIdPage } from '#/pages/product-id'

const BrandProductPage = () => {
  const { productId } = Route.useParams()

  return <ProductIdPage productId={productId} />
}

export const Route = createFileRoute('/_base-layout/brands/$brandId/$productId/')({
  component: BrandProductPage,
  beforeLoad: ({ params }) => requireNumericParams(params, ['brandId', 'productId']),
})
