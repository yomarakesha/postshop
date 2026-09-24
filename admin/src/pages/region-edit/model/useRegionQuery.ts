import { useQuery } from '@tanstack/react-query'

import { getRegionRegionsRegionIdGet } from '@/shared/openapi/requests'

export function useRegionQuery(regionId: number) {
  return useQuery({
    queryKey: ['regions', regionId],
    queryFn: () =>
      getRegionRegionsRegionIdGet({
        path: { region_id: regionId },
        throwOnError: true,
      }),
  })
}
