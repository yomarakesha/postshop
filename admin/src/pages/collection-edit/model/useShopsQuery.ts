import { useQuery } from '@tanstack/react-query'

import { ADMIN_LIST_LIMIT } from '@/shared/constants/pagination'
import { getAllShopsFullShopBasesFullGet } from '@/shared/openapi/requests'

export function useShopsQuery() {
  return useQuery({
    queryKey: ['shops-full'],
    queryFn: () =>
      getAllShopsFullShopBasesFullGet({ query: { limit: ADMIN_LIST_LIMIT }, throwOnError: true }),
  })
}
