import { useQuery } from '@tanstack/react-query'

import { getOrderOrdersOrderIdGet } from '@/shared/openapi/requests'

export function useOrderQuery(orderId: number) {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => getOrderOrdersOrderIdGet({ path: { order_id: orderId }, throwOnError: true }),
  })
}
