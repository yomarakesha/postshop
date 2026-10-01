import { useQuery } from '@tanstack/react-query'

import { isApiError } from '@/shared/lib/apiError'
import {
  getShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGet,
  getShopBaseShopBasesShopIdGet,
} from '@/shared/openapi/requests'
import type { ShopFullResponse } from '@/shared/openapi/requests'

/**
 * Магазин по id: карточка (ShopBase) и витрина (ShopAdditional).
 *
 * Раньше страница грузила первые 500 магазинов из /shop-bases/full и искала
 * свой в списке — у 501-го магазина страница была пустой, и на каждое
 * открытие качался весь список. Теперь два точечных запроса, собранные в ту
 * же форму ShopFullResponse, что ждёт страница.
 *
 * Ключ под префиксом ['stores']: мутации страницы (блокировка, тип склада)
 * сбрасывают именно его.
 */
export function useStoreDetailQuery(shopId: number) {
  return useQuery({
    queryKey: ['stores', shopId],
    queryFn: async (): Promise<ShopFullResponse> => {
      const [{ data: base }, additional] = await Promise.all([
        getShopBaseShopBasesShopIdGet({ path: { shop_id: shopId }, throwOnError: true }),
        // Витрины у магазина может ещё не быть (не заполнил) — сервер отвечает
        // 404, и это «нет витрины», а не ошибка страницы.
        getShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGet({
          path: { shop_base_id: shopId },
          throwOnError: true,
        }).then(
          ({ data }) => data,
          (error: unknown) => {
            if (isApiError(error) && error.status === 404) return null
            throw error
          },
        ),
      ])
      return { ...base, additional }
    },
    enabled: Number.isFinite(shopId),
  })
}
