import { useQuery } from '@tanstack/react-query'

import { readTotalCount } from '@/shared/hooks/useListControls'
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
      // Черновик — это документ, отправленный продавцом и ещё не принятый:
      // ровно то, что требует действия сотрудника. Считает сервер (заголовок
      // X-Total-Count): раньше считались черновики среди первых 500 приходов.
      const response = await listReceiptsStockReceiptsGet({
        query: { status: ReceiptStatus.DRAFT, limit: 1 },
        throwOnError: true,
      })
      return readTotalCount(response.response.headers, response.data.length)
    },
    refetchInterval: 60_000,
  })
}
