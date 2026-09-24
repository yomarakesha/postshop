import { useQuery } from '@tanstack/react-query'

import { getPendingShopsCountShopBasesPendingCountGet } from '@/shared/openapi/requests'

export function usePendingShopsCountQuery() {
  return useQuery({
    queryKey: ['shop-bases', 'pending-count'],
    queryFn: () => getPendingShopsCountShopBasesPendingCountGet({ throwOnError: true }),
    refetchInterval: 60_000,
  })
}
