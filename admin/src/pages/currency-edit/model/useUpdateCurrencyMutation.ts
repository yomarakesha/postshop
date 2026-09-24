import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { updateCurrencyCurrenciesCurrencyIdPut } from '@/shared/openapi/requests'
import type { CurrencyUpdate } from '@/shared/openapi/requests'

export function useUpdateCurrencyMutation(currencyId: number) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: CurrencyUpdate) =>
      updateCurrencyCurrenciesCurrencyIdPut({
        path: { currency_id: currencyId },
        body,
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] })
      navigate('/currencies')
    },
  })
}
