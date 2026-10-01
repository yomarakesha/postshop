import { useQuery } from '@tanstack/react-query'

import { ADMIN_LIST_LIMIT } from '@/shared/constants/pagination'
import { productModerationKeys } from '@/shared/lib/productModeration'
import { getModerationQueueProductsModerationGet } from '@/shared/openapi/requests'

export function useModerationQueueQuery() {
  return useQuery({
    queryKey: productModerationKeys.queue,
    queryFn: () =>
      getModerationQueueProductsModerationGet({
        query: { limit: ADMIN_LIST_LIMIT },
        throwOnError: true,
      }),
  })
}
