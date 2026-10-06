import { useQuery } from '@tanstack/react-query'

import { listReceiptsStockReceiptsGet } from '@/shared/openapi/requests'

export function useStockReceiptsQuery(paging: { skip: number; limit: number }) {
  return useQuery({
    queryKey: ['stock-receipts', 'list', paging],
    queryFn: () => listReceiptsStockReceiptsGet({ query: paging, throwOnError: true }),
  })
}
