import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  blockRegionRegionsRegionIdBlockPatch,
  unblockRegionRegionsRegionIdUnblockPatch,
} from '@/shared/openapi/requests'

export function useToggleRegionStatusMutation(regionId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (isActive: boolean) => {
      const action = isActive
        ? blockRegionRegionsRegionIdBlockPatch
        : unblockRegionRegionsRegionIdUnblockPatch

      return action({
        path: { region_id: regionId },
        throwOnError: true,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] })
    },
  })
}
