import { createFileRoute } from '@tanstack/react-router'
import { requireNumericParams } from '#/shared/lib/requireNumericParams'
import { StoreIdPage } from '#/pages/store-id'

const StoreIdRoute = () => {
  const { storeId } = Route.useParams()

  return <StoreIdPage storeId={storeId} />
}

export const Route = createFileRoute('/_base-layout/stores/$storeId/')({
  component: StoreIdRoute,
  beforeLoad: ({ params }) => requireNumericParams(params, ['storeId']),
})
