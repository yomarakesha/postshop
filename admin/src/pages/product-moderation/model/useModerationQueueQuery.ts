import { useQuery } from '@tanstack/react-query'

import { ADMIN_LIST_LIMIT } from '@/shared/constants/pagination'
import { getModerationQueueProductsModerationGet } from '@/shared/openapi/requests'

export function useModerationQueueQuery() {
  return useQuery({
    queryKey: ['products', 'moderation'],
    queryFn: () =>
      getModerationQueueProductsModerationGet({
        query: { limit: ADMIN_LIST_LIMIT },
        throwOnError: true,
      }),
  })
}
