import { useQuery } from '@tanstack/react-query'

import { pendingWithdrawalsCountWithdrawalsCountGet } from '@/shared/openapi/requests'

/** Сколько заявок продавцов на вывоз товара ждут склада — счётчик в меню. */
export function useWithdrawalsCountQuery(enabled = true) {
  return useQuery({
    enabled,
    queryKey: ['withdrawals', 'count'],
    queryFn: () => pendingWithdrawalsCountWithdrawalsCountGet({ throwOnError: true }),
    refetchInterval: 60_000,
  })
}
