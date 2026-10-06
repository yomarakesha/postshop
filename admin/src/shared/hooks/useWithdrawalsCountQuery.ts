import { useQuery } from '@tanstack/react-query'

import { COUNTER_REFETCH_MS } from '@/shared/constants/counters'
import { pendingWithdrawalsCountWithdrawalsCountGet } from '@/shared/openapi/requests'

/** Сколько заявок продавцов на вывоз товара ждут склада — счётчик в меню. */
export function useWithdrawalsCountQuery(enabled = true) {
  return useQuery({
    enabled,
    queryKey: ['withdrawals', 'count'],
    queryFn: () => pendingWithdrawalsCountWithdrawalsCountGet({ throwOnError: true }),
    refetchInterval: COUNTER_REFETCH_MS,
    refetchOnWindowFocus: true,
  })
}
