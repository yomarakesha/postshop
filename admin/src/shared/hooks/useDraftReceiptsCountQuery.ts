import { useQuery } from '@tanstack/react-query'

import { ADMIN_LIST_LIMIT } from '@/shared/constants/pagination'
import { ReceiptStatus, listReceiptsStockReceiptsGet } from '@/shared/openapi/requests'

/**
 * Сколько документов приёмки ждут подтверждения платформой.
 *
 * Отдельного счётчика в API нет, поэтому считаем по списку — он и так
 * запрашивается на странице приёмки, и второй запрос сюда не добавляет
 * нагрузки сверх обновления раз в минуту.
 */
export function useDraftReceiptsCountQuery(enabled = true) {
  return useQuery({
    // При выключенном складе платформы ручка отвечает 404 — не опрашиваем.
    enabled,
    queryKey: ['stock-receipts', 'draft-count'],
    queryFn: async () => {
      const response = await listReceiptsStockReceiptsGet({
        query: { limit: ADMIN_LIST_LIMIT },
        throwOnError: true,
      })
      // Черновик — это документ, отправленный продавцом и ещё не принятый:
      // ровно то, что требует действия сотрудника.
      return (response.data ?? []).filter((receipt) => receipt.status === ReceiptStatus.DRAFT)
        .length
    },
    refetchInterval: 60_000,
  })
}
