import { useQuery } from '@tanstack/react-query'

import { ADMIN_LIST_LIMIT } from '@/shared/constants/pagination'
import { listReturnsReturnsGet } from '@/shared/openapi/requests'
import type { ReturnStatus } from '@/shared/openapi/requests'

export function useReturnsQuery(status: ReturnStatus) {
  return useQuery({
    queryKey: ['returns', status],
    queryFn: () =>
      listReturnsReturnsGet({
        query: { limit: ADMIN_LIST_LIMIT, return_status: status },
        throwOnError: true,
      }),
  })
}
