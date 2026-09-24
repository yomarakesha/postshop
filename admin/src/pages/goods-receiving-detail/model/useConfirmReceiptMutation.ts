import { useMutation, useQueryClient } from '@tanstack/react-query'

import { confirmReceiptStockReceiptsReceiptIdConfirmPost } from '@/shared/openapi/requests'

/**
 * Подтверждение приёмки товара на склад.
 *
 * Это утверждение платформы, что товар физически принят: сервер тем же
 * действием заводит остаток. До появления этой кнопки документ продавца
 * оставался черновиком навсегда — отправить его было можно, принять некому.
 */
export function useConfirmReceiptMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (receiptId: number) =>
      confirmReceiptStockReceiptsReceiptIdConfirmPost({
        path: { receipt_id: receiptId },
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-receipts'] })
    },
  })
}
