import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { updateCollectionCollectionsCollectionIdPut } from '@/shared/openapi/requests'
import type { CollectionUpdate } from '@/shared/openapi/requests'

export function useUpdateCollectionMutation(collectionId: number) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: CollectionUpdate) =>
      updateCollectionCollectionsCollectionIdPut({
        path: { collection_id: collectionId },
        body,
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
      navigate('/collections')
    },
  })
}
