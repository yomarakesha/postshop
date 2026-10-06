import { useQuery } from '@tanstack/react-query'

import { COUNTER_REFETCH_MS } from '@/shared/constants/counters'
import { productModerationKeys } from '@/shared/lib/productModeration'
import { getModerationCountProductsModerationCountGet } from '@/shared/openapi/requests'

export function useModerationCountQuery() {
  return useQuery({
    queryKey: productModerationKeys.count,
    queryFn: () => getModerationCountProductsModerationCountGet({ throwOnError: true }),
    refetchInterval: COUNTER_REFETCH_MS,
    refetchOnWindowFocus: true,
  })
}
