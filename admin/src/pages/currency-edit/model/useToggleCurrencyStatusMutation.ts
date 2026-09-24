import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  blockCurrencyCurrenciesCurrencyIdBlockPatch,
  unblockCurrencyCurrenciesCurrencyIdUnblockPatch,
} from '@/shared/openapi/requests'

export function useToggleCurrencyStatusMutation(currencyId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (isActive: boolean) => {
      const action = isActive
        ? blockCurrencyCurrenciesCurrencyIdBlockPatch
        : unblockCurrencyCurrenciesCurrencyIdUnblockPatch

      return action({
        path: { currency_id: currencyId },
        throwOnError: true,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] })
    },
  })
}
