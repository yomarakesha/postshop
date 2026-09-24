import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { updateRegionRegionsRegionIdPut } from '@/shared/openapi/requests'
import type { RegionUpdate } from '@/shared/openapi/requests'

export function useUpdateRegionMutation(regionId: number) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: RegionUpdate) =>
      updateRegionRegionsRegionIdPut({
        path: { region_id: regionId },
        body,
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] })
      navigate('/regions')
    },
  })
}
