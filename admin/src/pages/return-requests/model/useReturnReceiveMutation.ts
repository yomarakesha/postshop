import { useMutation, useQueryClient } from '@tanstack/react-query'

import { receiveReturnReturnsRequestIdReceivePatch } from '@/shared/openapi/requests'

/**
 * Товар по одобренному возврату физически получен.
 *
 * Раньше остаток возвращался уже при подтверждении заявки — когда товар ещё
 * был у покупателя, а мог и вовсе прийти браком. Теперь в остаток он попадает
 * только здесь: restock=true — цел и снова продаётся, false — брак.
 */
export function useReturnReceiveMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, restock }: { requestId: number; restock: boolean }) =>
      receiveReturnReturnsRequestIdReceivePatch({
        path: { request_id: requestId },
        body: { restock },
        throwOnError: true,
      }),
    // И после отказа: возврат мог отметить продавец, пока сотрудник смотрел
    // на экран, — список должен показать настоящее состояние.
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['returns'] }),
  })
}
