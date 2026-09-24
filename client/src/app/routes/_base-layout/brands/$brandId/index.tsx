import { createFileRoute } from '@tanstack/react-router'
import { requireNumericParams } from '#/shared/lib/requireNumericParams'
import { BrandIdPage } from '#/pages/brand-id'

const BrandIdRoute = () => {
  const { brandId } = Route.useParams()
  return <BrandIdPage brandId={brandId} />
}

export const Route = createFileRoute('/_base-layout/brands/$brandId/')({
  component: BrandIdRoute,
  beforeLoad: ({ params }) => requireNumericParams(params, ['brandId']),
})
