import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { createMeasureUnitMeasureUnitsPost } from '@/shared/openapi/requests'
import type { MeasureUnitCreate } from '@/shared/openapi/requests'

export function useCreateMeasureUnitMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: MeasureUnitCreate) =>
      createMeasureUnitMeasureUnitsPost({ body, throwOnError: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measure-units'] })
      navigate('/measure-units')
    },
  })
}
