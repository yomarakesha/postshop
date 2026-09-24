import { useQuery } from '@tanstack/react-query'

import { getProductForModerationProductsModerationProductIdGet } from '@/shared/openapi/requests'

export function useProductQuery(productId: number) {
  return useQuery({
    queryKey: ['moderation-product', productId],
    queryFn: () =>
      getProductForModerationProductsModerationProductIdGet({
        path: { product_id: productId },
        throwOnError: true,
      }),
  })
}
