import { useQuery } from '@tanstack/react-query'

import type { RegistrationStatus } from '@/shared/openapi/requests'
import { getShopBasesShopBasesGet } from '@/shared/openapi/requests'

export function useShopBasesQuery(
  status: RegistrationStatus,
  paging: { skip: number; limit: number },
) {
  return useQuery({
    queryKey: ['shop-bases', status, paging],
    queryFn: () =>
      getShopBasesShopBasesGet({
        query: { ...paging, registration_status: status },
        throwOnError: true,
      }),
  })
}
