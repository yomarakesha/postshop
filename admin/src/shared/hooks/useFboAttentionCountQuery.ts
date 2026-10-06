import { useQuery } from '@tanstack/react-query'

import { COUNTER_REFETCH_MS } from '@/shared/constants/counters'
import { getFboAttentionCountOrdersFboAttentionCountGet } from '@/shared/openapi/requests'

/**
 * Сколько заказов ждут сборки складом Postshop: заказ принят, а часть FBO ещё
 * не принята или не собрана. Её собирает сотрудник, и раньше найти такую
 * работу можно было, только открывая заказы по одному.
 *
 * Ключ под префиксом ['orders']: смена статуса части его сбрасывает.
 */
export function useFboAttentionCountQuery(enabled = true) {
  return useQuery({
    enabled,
    queryKey: ['orders', 'fbo-attention-count'],
    queryFn: () => getFboAttentionCountOrdersFboAttentionCountGet({ throwOnError: true }),
    refetchInterval: COUNTER_REFETCH_MS,
    refetchOnWindowFocus: true,
  })
}
