import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import {
  addItemStockReceiptsReceiptIdItemsPost,
  confirmReceiptStockReceiptsReceiptIdConfirmPost,
  createReceiptStockReceiptsPost,
} from '@/shared/openapi/requests'
import type { StockReceiptCreate, StockReceiptItemCreate } from '@/shared/openapi/requests'

interface CreateReceiptPayload {
  receipt: StockReceiptCreate
  items: Omit<StockReceiptItemCreate, 'receipt_id'>[]
}

export function useCreateReceiptMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async ({ receipt, items }: CreateReceiptPayload) => {
      const created = await createReceiptStockReceiptsPost({
        body: receipt,
        throwOnError: true,
      })

      const receiptId = created.data.id

      for (const item of items) {
        await addItemStockReceiptsReceiptIdItemsPost({
          path: { receipt_id: receiptId },
          body: item,
          throwOnError: true,
        })
      }

      await confirmReceiptStockReceiptsReceiptIdConfirmPost({
        path: { receipt_id: receiptId },
        throwOnError: true,
      })

      return created.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-receipts'] })
      navigate('/goods-receiving')
    },
  })
}
