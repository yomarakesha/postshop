import { useQuery } from '@tanstack/react-query'

import { getShopBaseShopBasesShopIdGet } from '@/shared/openapi/requests'

export function useShopBaseQuery(shopId: number) {
  return useQuery({
    queryKey: ['shop-bases', shopId],
    queryFn: () =>
      getShopBaseShopBasesShopIdGet({
        path: { shop_id: shopId },
        throwOnError: true,
      }),
  })
}
