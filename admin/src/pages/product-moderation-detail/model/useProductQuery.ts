import { useQuery } from '@tanstack/react-query'

import { productModerationKeys } from '@/shared/lib/productModeration'
import { getProductForModerationProductsModerationProductIdGet } from '@/shared/openapi/requests'

export function useProductQuery(productId: number) {
  return useQuery({
    queryKey: productModerationKeys.detail(productId),
    queryFn: () =>
      getProductForModerationProductsModerationProductIdGet({
        path: { product_id: productId },
        throwOnError: true,
      }),
  })
}
