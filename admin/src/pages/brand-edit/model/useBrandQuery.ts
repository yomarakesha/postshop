import { useQuery } from '@tanstack/react-query'

import { getBrandBrandsBrandIdGet } from '@/shared/openapi/requests'

export function useBrandQuery(brandId: number) {
  return useQuery({
    queryKey: ['brands', brandId],
    queryFn: () =>
      getBrandBrandsBrandIdGet({
        path: { brand_id: brandId },
        throwOnError: true,
      }),
  })
}
