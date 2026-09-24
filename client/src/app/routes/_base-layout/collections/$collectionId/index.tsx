import { createFileRoute } from '@tanstack/react-router'
import { requireNumericParams } from '#/shared/lib/requireNumericParams'
import { CollectionIdPage } from '#/pages/collection-id'

const CollectionRoute = () => {
  const { collectionId } = Route.useParams()

  return <CollectionIdPage collectionId={collectionId} />
}

export const Route = createFileRoute('/_base-layout/collections/$collectionId/')({
  component: CollectionRoute,
  beforeLoad: ({ params }) => requireNumericParams(params, ['collectionId']),
})
