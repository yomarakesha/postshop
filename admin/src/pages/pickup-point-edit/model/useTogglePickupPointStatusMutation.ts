import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  blockPickupPointPickupPointsPickupPointIdBlockPatch,
  unblockPickupPointPickupPointsPickupPointIdUnblockPatch,
} from '@/shared/openapi/requests'

export function useTogglePickupPointStatusMutation(pickupPointId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (isActive: boolean) => {
      const action = isActive
        ? blockPickupPointPickupPointsPickupPointIdBlockPatch
        : unblockPickupPointPickupPointsPickupPointIdUnblockPatch

      return action({
        path: { pickup_point_id: pickupPointId },
        throwOnError: true,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickup-points'] })
    },
  })
}
