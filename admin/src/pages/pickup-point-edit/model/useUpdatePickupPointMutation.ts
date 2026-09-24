import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { updatePickupPointPickupPointsPickupPointIdPut } from '@/shared/openapi/requests'
import type { PickupPointUpdate } from '@/shared/openapi/requests'

export function useUpdatePickupPointMutation(pickupPointId: number) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: PickupPointUpdate) =>
      updatePickupPointPickupPointsPickupPointIdPut({
        path: { pickup_point_id: pickupPointId },
        body,
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickup-points'] })
      navigate('/pickup-points')
    },
  })
}
