import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  blockMeasureUnitMeasureUnitsUnitIdBlockPatch,
  unblockMeasureUnitMeasureUnitsUnitIdUnblockPatch,
} from '@/shared/openapi/requests'

export function useToggleMeasureUnitStatusMutation(unitId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (isActive: boolean) => {
      const action = isActive
        ? blockMeasureUnitMeasureUnitsUnitIdBlockPatch
        : unblockMeasureUnitMeasureUnitsUnitIdUnblockPatch

      return action({
        path: { unit_id: unitId },
        throwOnError: true,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measure-units'] })
    },
  })
}
