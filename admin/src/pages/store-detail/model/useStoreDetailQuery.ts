import { useQuery } from '@tanstack/react-query'

import { ADMIN_LIST_LIMIT } from '@/shared/constants/pagination'
import { getAllShopsFullShopBasesFullGet } from '@/shared/openapi/requests'

export function useStoreDetailQuery(shopId: number) {
  return useQuery({
    queryKey: ['stores'],
    queryFn: () =>
      getAllShopsFullShopBasesFullGet({ query: { limit: ADMIN_LIST_LIMIT }, throwOnError: true }),
    select: (res) => res.data?.find((shop) => shop.id === shopId),
  })
}
