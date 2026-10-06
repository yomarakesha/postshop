import { useQuery } from '@tanstack/react-query'

import { moderationQueueReviewsModerationGet } from '@/shared/openapi/requests'
import type { ReviewStatus } from '@/shared/openapi/requests'

export function useReviewQueueQuery(status: ReviewStatus, paging: { skip: number; limit: number }) {
  return useQuery({
    queryKey: ['reviews', 'moderation', status, paging],
    queryFn: () =>
      moderationQueueReviewsModerationGet({
        query: { ...paging, review_status: status },
        throwOnError: true,
      }),
  })
}
