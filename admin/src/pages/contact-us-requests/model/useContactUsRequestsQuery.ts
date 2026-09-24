import { useQuery } from '@tanstack/react-query'

import { ADMIN_LIST_LIMIT } from '@/shared/constants/pagination'
import { readContactUsContactUsGet } from '@/shared/openapi/requests'

export function useContactUsRequestsQuery() {
  return useQuery({
    queryKey: ['contact-us-requests'],
    queryFn: () =>
      readContactUsContactUsGet({ query: { limit: ADMIN_LIST_LIMIT }, throwOnError: true }),
  })
}
