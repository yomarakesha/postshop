import { useQuery } from '@tanstack/react-query'

import { readContactUsContactUsGet } from '@/shared/openapi/requests'

export function useContactUsRequestsQuery(paging: { skip: number; limit: number }) {
  return useQuery({
    queryKey: ['contact-us-requests', paging],
    queryFn: () => readContactUsContactUsGet({ query: paging, throwOnError: true }),
  })
}
