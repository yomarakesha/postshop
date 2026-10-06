import { useQuery } from '@tanstack/react-query'

import { productModerationKeys } from '@/shared/lib/productModeration'
import { getModerationQueueProductsModerationGet } from '@/shared/openapi/requests'

export function useModerationQueueQuery(paging: { skip: number; limit: number }) {
  return useQuery({
    queryKey: [...productModerationKeys.queue, paging],
    queryFn: () =>
      getModerationQueueProductsModerationGet({
        query: paging,
        throwOnError: true,
      }),
  })
}
