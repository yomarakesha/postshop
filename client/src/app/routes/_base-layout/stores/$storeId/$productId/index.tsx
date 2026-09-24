import { createFileRoute } from '@tanstack/react-router'
import { requireNumericParams } from '#/shared/lib/requireNumericParams'
import { ProductIdPage } from '#/pages/product-id'

const StoreProductPage = () => {
  const { storeId, productId } = Route.useParams()

  return <ProductIdPage productId={productId} storeId={storeId} />
}

export const Route = createFileRoute('/_base-layout/stores/$storeId/$productId/')({
  component: StoreProductPage,
  beforeLoad: ({ params }) => requireNumericParams(params, ['storeId', 'productId']),
})
