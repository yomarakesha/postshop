import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  blockProductProductsProductIdBlockPatch,
  unblockProductProductsProductIdUnblockPatch,
} from '@/shared/openapi/requests'

/**
 * Снять товар с продажи или вернуть его — решением платформы.
 *
 * В админке этого сделать было негде: товар можно было только одобрить или
 * отклонить, а одобренный и проданный оставался в каталоге, что бы с ним ни
 * случилось. Снятие платформой продавец отменить не может.
 */
export function useProductSaleMutation(productId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (forSale: boolean) =>
      forSale
        ? unblockProductProductsProductIdUnblockPatch({
            path: { product_id: productId },
            throwOnError: true,
          })
        : blockProductProductsProductIdBlockPatch({
            path: { product_id: productId },
            throwOnError: true,
          }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
