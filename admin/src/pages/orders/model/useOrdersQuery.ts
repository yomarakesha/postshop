import { useQuery } from '@tanstack/react-query'

import { ADMIN_LIST_LIMIT } from '@/shared/constants/pagination'
import { getOrdersOrdersGet } from '@/shared/openapi/requests'
import type { GetOrdersOrdersGetData } from '@/shared/openapi/requests'

export function useOrdersQuery(params?: GetOrdersOrdersGetData['query']) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () =>
      getOrdersOrdersGet({
        // Лимит по умолчанию: без него бэкенд отдавал только 20 заказов.
        query: { limit: ADMIN_LIST_LIMIT, ...params },
        throwOnError: true,
      }),
  })
}
