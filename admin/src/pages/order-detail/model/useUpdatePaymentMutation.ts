import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateOrderPaymentOrdersOrderIdPaymentPatch } from '@/shared/openapi/requests'

/**
 * Отметить, что деньги за заказ получены, или снять ошибочную отметку.
 *
 * Без отметки заказ не завершить: раньше завершённый заказ считался проданным,
 * получены деньги или нет.
 */
export function useUpdatePaymentMutation(orderId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (paid: boolean) =>
      updateOrderPaymentOrdersOrderIdPaymentPatch({
        path: { order_id: orderId },
        body: { paid },
        throwOnError: true,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
