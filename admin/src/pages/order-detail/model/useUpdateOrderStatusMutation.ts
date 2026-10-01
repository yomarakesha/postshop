import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateOrderStatusOrdersOrderIdStatusPatch } from '@/shared/openapi/requests'
import type { OrderStatusCode } from '@/shared/openapi/requests'

interface UpdateOrderStatusParams {
  statusCode: OrderStatusCode
  deliveryPrice?: string | null
}

export function useUpdateOrderStatusMutation(orderId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ statusCode, deliveryPrice }: UpdateOrderStatusParams) =>
      updateOrderStatusOrdersOrderIdStatusPatch({
        path: { order_id: orderId },
        body: { status_code: statusCode, delivery_price: deliveryPrice },
        throwOnError: true,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders', orderId] })
      // Префикс ['orders'] сбрасывает и список, и счётчик новых заказов в меню
      // (pendingOrdersCountKey): принятый заказ сразу пропадает из счётчика,
      // а не через полминуты опроса.
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
