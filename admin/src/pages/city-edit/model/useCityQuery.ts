import { useQuery } from '@tanstack/react-query'

import { getCityCitiesCityIdGet } from '@/shared/openapi/requests'

export function useCityQuery(cityId: number) {
  return useQuery({
    queryKey: ['cities', cityId],
    queryFn: () =>
      getCityCitiesCityIdGet({
        path: { city_id: cityId },
        throwOnError: true,
      }),
  })
}
