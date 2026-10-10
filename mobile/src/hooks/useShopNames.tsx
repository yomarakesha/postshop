import { useMemo } from 'react'
import { shopAdditionalApi } from '@/api/shopAdditionalApi'
import { MAX_PAGE_SIZE } from '@/constants/pagination'

/**
 * Названия магазинов по идентификатору базы магазина.
 *
 * У товара есть только `shop_base_id` — названия в нём нет, поэтому карточка
 * товара показывала бренд и выдавала его за магазин. Витрина решает это так
 * же: один раз тянет справочник магазинов и раскладывает в карту
 * (`pages/home/ui/Collections`).
 *
 * Хук вызывается из каждой карточки, но запрос уходит один: ключ запроса у
 * всех одинаковый, и React Query отдаёт остальным готовый кэш.
 */
export const useShopNames = () => {
  const { data } = shopAdditionalApi.useGetAll({
    skip: 0,
    limit: MAX_PAGE_SIZE,
  })

  return useMemo(() => {
    const map = new Map<number, string>()
    for (const shop of data ?? []) {
      if (shop.name) map.set(shop.shop_base_id, shop.name)
    }
    return map
  }, [data])
}

export default useShopNames
