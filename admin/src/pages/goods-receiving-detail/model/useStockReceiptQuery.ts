import { useQuery } from '@tanstack/react-query'

import { getReceiptStockReceiptsReceiptIdGet } from '@/shared/openapi/requests'

export function useStockReceiptQuery(receiptId: number) {
  return useQuery({
    queryKey: ['stock-receipts', receiptId],
    queryFn: () =>
      getReceiptStockReceiptsReceiptIdGet({
        path: { receipt_id: receiptId },
        throwOnError: true,
      }),
    enabled: !isNaN(receiptId),
  })
}
