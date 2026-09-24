import { useQuery } from '@tanstack/react-query'

import { moderationCountReviewsModerationCountGet } from '@/shared/openapi/requests'

export function useReviewModerationCountQuery() {
  return useQuery({
    queryKey: ['reviews', 'moderation-count'],
    queryFn: () => moderationCountReviewsModerationCountGet({ throwOnError: true }),
    refetchInterval: 60_000,
  })
}
