import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  blockCollectionCollectionsCollectionIdBlockPatch,
  unblockCollectionCollectionsCollectionIdUnblockPatch,
} from '@/shared/openapi/requests'

export function useToggleCollectionStatusMutation(collectionId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (isActive: boolean) => {
      const action = isActive
        ? blockCollectionCollectionsCollectionIdBlockPatch
        : unblockCollectionCollectionsCollectionIdUnblockPatch

      return action({
        path: { collection_id: collectionId },
        throwOnError: true,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    },
  })
}
