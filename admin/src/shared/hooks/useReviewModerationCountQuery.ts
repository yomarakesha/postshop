import { useQuery } from '@tanstack/react-query'

import { COUNTER_REFETCH_MS } from '@/shared/constants/counters'
import { moderationCountReviewsModerationCountGet } from '@/shared/openapi/requests'

export function useReviewModerationCountQuery() {
  return useQuery({
    queryKey: ['reviews', 'moderation-count'],
    queryFn: () => moderationCountReviewsModerationCountGet({ throwOnError: true }),
    refetchInterval: COUNTER_REFETCH_MS,
    refetchOnWindowFocus: true,
  })
}
