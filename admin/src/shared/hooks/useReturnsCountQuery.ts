import { useQuery } from '@tanstack/react-query'

import { pendingCountReturnsCountGet } from '@/shared/openapi/requests'

export function useReturnsCountQuery() {
  return useQuery({
    queryKey: ['returns', 'count'],
    queryFn: () => pendingCountReturnsCountGet({ throwOnError: true }),
    refetchInterval: 60_000,
  })
}
