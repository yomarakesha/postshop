import { useQuery } from '@tanstack/react-query'

import { getCollectionCollectionsCollectionIdGet } from '@/shared/openapi/requests'

export function useCollectionQuery(collectionId: number) {
  return useQuery({
    queryKey: ['collections', collectionId],
    queryFn: () =>
      getCollectionCollectionsCollectionIdGet({
        path: { collection_id: collectionId },
        throwOnError: true,
      }),
  })
}
