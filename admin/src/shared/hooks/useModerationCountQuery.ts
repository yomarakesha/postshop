import { useQuery } from '@tanstack/react-query'

import { getModerationCountProductsModerationCountGet } from '@/shared/openapi/requests'

export function useModerationCountQuery() {
  return useQuery({
    queryKey: ['products', 'moderation-count'],
    queryFn: () => getModerationCountProductsModerationCountGet({ throwOnError: true }),
    refetchInterval: 60_000,
  })
}
