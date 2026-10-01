import { useQuery } from '@tanstack/react-query'

import { productModerationKeys } from '@/shared/lib/productModeration'
import { getModerationCountProductsModerationCountGet } from '@/shared/openapi/requests'

export function useModerationCountQuery() {
  return useQuery({
    queryKey: productModerationKeys.count,
    queryFn: () => getModerationCountProductsModerationCountGet({ throwOnError: true }),
    refetchInterval: 60_000,
  })
}
