import { useQuery } from '@tanstack/react-query'

import { isApiError } from '@/shared/lib/apiError'
import { getShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGet } from '@/shared/openapi/requests'

/**
 * Данные витрины магазина — ради типа склада на странице заявки.
 *
 * Заявка отдаёт только ShopBase, где типа склада нет. У новой заявки витрины
 * может ещё не быть (сервер отвечает 404) — это не ошибка, а «тип не выбран».
 */
export function useShopAdditionalQuery(shopId: number) {
  return useQuery({
    queryKey: ['shop-bases', shopId, 'additional'],
    queryFn: async () => {
      try {
        const { data } = await getShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGet({
          path: { shop_base_id: shopId },
          throwOnError: true,
        })
        return data
      } catch (error) {
        if (isApiError(error) && error.status === 404) return null
        throw error
      }
    },
  })
}
