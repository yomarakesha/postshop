import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { updateMeasureUnitMeasureUnitsUnitIdPut } from '@/shared/openapi/requests'
import type { MeasureUnitUpdate } from '@/shared/openapi/requests'

export function useUpdateMeasureUnitMutation(unitId: number) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: MeasureUnitUpdate) =>
      updateMeasureUnitMeasureUnitsUnitIdPut({
        path: { unit_id: unitId },
        body,
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measure-units'] })
      navigate('/measure-units')
    },
  })
}
