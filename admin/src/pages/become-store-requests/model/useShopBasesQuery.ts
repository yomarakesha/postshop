import { useQuery } from '@tanstack/react-query'

import { ADMIN_LIST_LIMIT } from '@/shared/constants/pagination'
import { getShopBasesShopBasesGet } from '@/shared/openapi/requests'

export function useShopBasesQuery() {
  return useQuery({
    queryKey: ['shop-bases'],
    queryFn: () =>
      getShopBasesShopBasesGet({ query: { limit: ADMIN_LIST_LIMIT }, throwOnError: true }),
  })
}
