import { useQuery } from '@tanstack/react-query'

import { ADMIN_LIST_LIMIT } from '@/shared/constants/pagination'
import { getAllShopsFullShopBasesFullGet } from '@/shared/openapi/requests'

export function useStoresQuery(search?: string) {
  return useQuery({
    queryKey: ['stores', search],
    queryFn: () =>
      getAllShopsFullShopBasesFullGet({
        query: { search: search || undefined, limit: ADMIN_LIST_LIMIT },
        throwOnError: true,
      }),
  })
}
