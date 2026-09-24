import { useQuery } from '@tanstack/react-query'

import { ADMIN_LIST_LIMIT } from '@/shared/constants/pagination'
import { getCitiesCitiesGet } from '@/shared/openapi/requests'

export function useCitiesQuery() {
  const { data, ...rest } = useQuery({
    queryKey: ['cities'],
    queryFn: () => getCitiesCitiesGet({ query: { limit: ADMIN_LIST_LIMIT }, throwOnError: true }),
  })

  return { cities: data?.data ?? [], ...rest }
}
