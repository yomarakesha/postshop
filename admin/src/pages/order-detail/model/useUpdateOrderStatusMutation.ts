import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateOrderStatusOrdersOrderIdStatusPatch } from '@/shared/openapi/requests'
import type { OrderStatusCode } from '@/shared/openapi/requests'

interface UpdateOrderStatusParams {
  statusCode: OrderStatusCode
  deliveryPrice?: string | null
  /** Решение платформы — например, причина отказа. Пишется в status_comment. */
  comment?: string | null
}

export function useUpdateOrderStatusMutation(orderId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ statusCode, deliveryPrice, comment }: UpdateOrderStatusParams) =>
      updateOrderStatusOrdersOrderIdStatusPatch({
        path: { order_id: orderId },
        body: { status_code: statusCode, delivery_price: deliveryPrice, comment },
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
