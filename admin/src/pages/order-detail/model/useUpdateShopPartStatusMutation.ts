import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateShopOrderStatusOrdersOrderIdShopShopIdStatusPatch } from '@/shared/openapi/requests'
import type { LocalOrderStatusCode } from '@/shared/openapi/requests'

interface UpdateShopPartStatusParams {
  shopId: number
  statusCode: LocalOrderStatusCode
  comment?: string | null
}

/**
 * Смена статуса части заказа, которую собирает склад Postshop (FBO).
 *
 * Товар FBO лежит на складе платформы, а «принимал» такую часть и отмечал
 * «готов к выдаче» продавец, физически ничего не собиравший. Сервер теперь
 * отказывает продавцу (403), и статус этой части ведёт сотрудник — отсюда.
 */
export function useUpdateShopPartStatusMutation(orderId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ shopId, statusCode, comment }: UpdateShopPartStatusParams) =>
      updateShopOrderStatusOrdersOrderIdShopShopIdStatusPatch({
        path: { order_id: orderId, shop_id: shopId },
        body: { status_code: statusCode, comment: comment || null },
        throwOnError: true,
      }),
    // И после отказа тоже: статус части мог поменять кто-то другой, и экран
    // должен показать настоящий. Промис держит кнопки занятыми до перезапроса.
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })
}
