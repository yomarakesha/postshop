import { useQuery } from '@tanstack/react-query'

import { listReturnsReturnsGet } from '@/shared/openapi/requests'
import type { ReturnStatus } from '@/shared/openapi/requests'

export function useReturnsQuery(status: ReturnStatus, paging: { skip: number; limit: number }) {
  return useQuery({
    queryKey: ['returns', status, paging],
    queryFn: () =>
      listReturnsReturnsGet({
        query: { ...paging, return_status: status },
        throwOnError: true,
      }),
  })
}
