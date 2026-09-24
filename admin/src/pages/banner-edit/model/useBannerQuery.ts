import { useQuery } from '@tanstack/react-query'

import { getBannerBannersBannerIdGet } from '@/shared/openapi/requests'

export function useBannerQuery(bannerId: number) {
  return useQuery({
    queryKey: ['banners', bannerId],
    queryFn: () =>
      getBannerBannersBannerIdGet({
        path: { banner_id: bannerId },
        throwOnError: true,
      }),
  })
}
