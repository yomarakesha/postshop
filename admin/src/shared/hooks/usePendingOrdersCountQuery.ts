import { useQuery } from '@tanstack/react-query'

import { getPendingOrdersCountOrdersPendingCountGet } from '@/shared/openapi/requests'

/** Ключ под общим префиксом ['orders']: любая смена статуса заказа его сбрасывает. */
export const pendingOrdersCountKey = ['orders', 'pending-count'] as const

/**
 * Сколько заказов ждут подтверждения оператором — счётчик у «Заказов» в меню.
 *
 * Раньше у модерации, возвратов и приёмки счётчики были, а у заказов — нет:
 * оператор узнавал о новом заказе, только открыв список («оператор не видит
 * заказы»). Заказ ждёт живого покупателя, поэтому опрос чаще, чем у остальных
 * счётчиков, и ещё при возврате на вкладку.
 *
 * Ручка требует права менять статус заказа — без него не опрашиваем, иначе
 * каждые 30 секунд летел бы 403.
 */
export function usePendingOrdersCountQuery(enabled = true) {
  return useQuery({
    enabled,
    queryKey: pendingOrdersCountKey,
    queryFn: () => getPendingOrdersCountOrdersPendingCountGet({ throwOnError: true }),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })
}
