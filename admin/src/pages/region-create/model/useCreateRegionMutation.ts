import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { createRegionRegionsPost } from '@/shared/openapi/requests'
import type { RegionCreate } from '@/shared/openapi/requests'

export function useCreateRegionMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: RegionCreate) => createRegionRegionsPost({ body, throwOnError: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] })
      navigate('/regions')
    },
  })
}
