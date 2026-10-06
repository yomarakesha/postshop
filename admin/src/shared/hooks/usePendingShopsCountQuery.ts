import { useQuery } from '@tanstack/react-query'

import { COUNTER_REFETCH_MS } from '@/shared/constants/counters'
import { getPendingShopsCountShopBasesPendingCountGet } from '@/shared/openapi/requests'

export function usePendingShopsCountQuery() {
  return useQuery({
    queryKey: ['shop-bases', 'pending-count'],
    queryFn: () => getPendingShopsCountShopBasesPendingCountGet({ throwOnError: true }),
    refetchInterval: COUNTER_REFETCH_MS,
    refetchOnWindowFocus: true,
  })
}
