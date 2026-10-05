import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  cancelReceiptStockReceiptsReceiptIdCancelPost,
  updateItemQuantityStockReceiptsReceiptIdItemsItemIdPatch,
} from '@/shared/openapi/requests'

/**
 * Отменить черновик приёмки. Магазин не привёз товар — раньше складчику
 * оставалось только ждать: документ висел черновиком навсегда.
 */
export function useCancelReceiptMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (receiptId: number) =>
      cancelReceiptStockReceiptsReceiptIdCancelPost({
        path: { receipt_id: receiptId },
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-receipts'] })
    },
  })
}

/**
 * Исправить количество позиции до подтверждения: привезли не столько,
 * сколько заявили. Подтверждается то, что фактически принято.
 */
export function useUpdateReceiptItemMutation(receiptId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: string }) =>
      updateItemQuantityStockReceiptsReceiptIdItemsItemIdPatch({
        path: { receipt_id: receiptId, item_id: itemId },
        body: { quantity },
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-receipts'] })
    },
  })
}
