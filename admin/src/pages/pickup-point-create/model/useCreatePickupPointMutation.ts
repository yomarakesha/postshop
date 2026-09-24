import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { createPickupPointPickupPointsPost } from '@/shared/openapi/requests'
import type { PickupPointCreate } from '@/shared/openapi/requests'

export function useCreatePickupPointMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: PickupPointCreate) =>
      createPickupPointPickupPointsPost({ body, throwOnError: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickup-points'] })
      navigate('/pickup-points')
    },
  })
}
