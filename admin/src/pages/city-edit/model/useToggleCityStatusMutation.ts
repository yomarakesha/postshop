import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  blockCityCitiesCityIdBlockPatch,
  unblockCityCitiesCityIdUnblockPatch,
} from '@/shared/openapi/requests'

export function useToggleCityStatusMutation(cityId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (isActive: boolean) => {
      const action = isActive
        ? blockCityCitiesCityIdBlockPatch
        : unblockCityCitiesCityIdUnblockPatch

      return action({
        path: { city_id: cityId },
        throwOnError: true,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] })
    },
  })
}
