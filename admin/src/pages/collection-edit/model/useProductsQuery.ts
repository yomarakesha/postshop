import { useQuery } from '@tanstack/react-query'

import { ADMIN_LIST_LIMIT } from '@/shared/constants/pagination'
import { getProductsProductsGet } from '@/shared/openapi/requests'

export function useProductsQuery() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () =>
      getProductsProductsGet({ query: { limit: ADMIN_LIST_LIMIT }, throwOnError: true }),
  })
}
