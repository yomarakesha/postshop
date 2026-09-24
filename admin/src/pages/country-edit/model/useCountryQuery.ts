import { useQuery } from '@tanstack/react-query'

import { getCountryCountriesCountryIdGet } from '@/shared/openapi/requests'

export function useCountryQuery(countryId: number) {
  return useQuery({
    queryKey: ['countries', countryId],
    queryFn: () =>
      getCountryCountriesCountryIdGet({
        path: { country_id: countryId },
        throwOnError: true,
      }),
  })
}
