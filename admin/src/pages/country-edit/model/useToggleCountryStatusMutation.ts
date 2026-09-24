import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  blockCountryCountriesCountryIdBlockPatch,
  unblockCountryCountriesCountryIdUnblockPatch,
} from '@/shared/openapi/requests'

export function useToggleCountryStatusMutation(countryId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (isActive: boolean) => {
      const action = isActive
        ? blockCountryCountriesCountryIdBlockPatch
        : unblockCountryCountriesCountryIdUnblockPatch

      return action({
        path: { country_id: countryId },
        throwOnError: true,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] })
    },
  })
}
