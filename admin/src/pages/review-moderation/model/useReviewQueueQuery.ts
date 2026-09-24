import { useQuery } from '@tanstack/react-query'

import { ADMIN_LIST_LIMIT } from '@/shared/constants/pagination'
import { moderationQueueReviewsModerationGet } from '@/shared/openapi/requests'
import type { ReviewStatus } from '@/shared/openapi/requests'

export function useReviewQueueQuery(status: ReviewStatus) {
  return useQuery({
    queryKey: ['reviews', 'moderation', status],
    queryFn: () =>
      moderationQueueReviewsModerationGet({
        query: { limit: ADMIN_LIST_LIMIT, review_status: status },
        throwOnError: true,
      }),
  })
}
