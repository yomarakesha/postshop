import { useQuery } from '@tanstack/react-query'

import { ADMIN_LIST_LIMIT } from '@/shared/constants/pagination'
import { getRegionsRegionsGet } from '@/shared/openapi/requests'

export function useRegionsQuery() {
  const { data, ...rest } = useQuery({
    queryKey: ['regions'],
    queryFn: () => getRegionsRegionsGet({ query: { limit: ADMIN_LIST_LIMIT }, throwOnError: true }),
  })

  return { regions: data?.data ?? [], ...rest }
}
