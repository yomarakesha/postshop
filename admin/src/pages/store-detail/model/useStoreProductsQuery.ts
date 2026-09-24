import { useQuery } from '@tanstack/react-query'

import { getProductsProductsGet } from '@/shared/openapi/requests'

export const STORE_PRODUCTS_PAGE_SIZE = 20

export function useStoreProductsQuery(shopId: number, page: number) {
  return useQuery({
    queryKey: ['store-products', shopId, page],
    queryFn: () =>
      getProductsProductsGet({
        query: {
          shop_base_ids: [shopId],
          skip: page * STORE_PRODUCTS_PAGE_SIZE,
          limit: STORE_PRODUCTS_PAGE_SIZE,
        },
        throwOnError: true,
      }),
  })
}
