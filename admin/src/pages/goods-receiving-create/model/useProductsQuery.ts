import { useQuery } from '@tanstack/react-query'

import { ADMIN_LIST_LIMIT } from '@/shared/constants/pagination'
import { getProductsProductsGet } from '@/shared/openapi/requests'

export function useProductsQuery(shopBaseId: number | null) {
  return useQuery({
    queryKey: ['products', shopBaseId],
    queryFn: () =>
      getProductsProductsGet({
        query: shopBaseId ? { shop_base_ids: [shopBaseId], limit: ADMIN_LIST_LIMIT } : undefined,
        throwOnError: true,
      }),
    enabled: !!shopBaseId,
  })
}
