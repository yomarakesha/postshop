import { useQuery } from '@tanstack/react-query'

import { ADMIN_LIST_LIMIT } from '@/shared/constants/pagination'
import { getCountriesCountriesGet } from '@/shared/openapi/requests'

export function useCountriesQuery() {
  const { data, ...rest } = useQuery({
    queryKey: ['countries'],
    queryFn: () =>
      getCountriesCountriesGet({ query: { limit: ADMIN_LIST_LIMIT }, throwOnError: true }),
  })

  return { countries: data?.data ?? [], ...rest }
}
