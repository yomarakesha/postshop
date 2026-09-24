import { useQuery } from '@tanstack/react-query'

import { ADMIN_LIST_LIMIT } from '@/shared/constants/pagination'
import { listReceiptsStockReceiptsGet } from '@/shared/openapi/requests'

export function useStockReceiptsQuery() {
  return useQuery({
    queryKey: ['stock-receipts'],
    queryFn: () =>
      listReceiptsStockReceiptsGet({ query: { limit: ADMIN_LIST_LIMIT }, throwOnError: true }),
  })
}
