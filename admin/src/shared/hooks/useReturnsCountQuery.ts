import { useQuery } from '@tanstack/react-query'

import { COUNTER_REFETCH_MS } from '@/shared/constants/counters'
import { pendingCountReturnsCountGet } from '@/shared/openapi/requests'

export function useReturnsCountQuery() {
  return useQuery({
    queryKey: ['returns', 'count'],
    queryFn: () => pendingCountReturnsCountGet({ throwOnError: true }),
    refetchInterval: COUNTER_REFETCH_MS,
    refetchOnWindowFocus: true,
  })
}
