import { useQuery } from '@tanstack/react-query'

import { getCurrencyCurrenciesCurrencyIdGet } from '@/shared/openapi/requests'

export function useCurrencyQuery(currencyId: number) {
  return useQuery({
    queryKey: ['currencies', currencyId],
    queryFn: () =>
      getCurrencyCurrenciesCurrencyIdGet({
        path: { currency_id: currencyId },
        throwOnError: true,
      }),
  })
}
