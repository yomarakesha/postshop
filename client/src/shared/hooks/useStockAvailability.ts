import { useCallback, useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import type { ProductAvailability } from '#/shared/openapi/requests/types.gen'
import { getProductsAvailabilityStockOperationsAvailabilityGet } from '#/shared/openapi/requests'
import { UseGetProductsAvailabilityStockOperationsAvailabilityGetKeyFn } from '#/shared/openapi/queries/common'

/**
 * Сколько товаров спрашиваем одним запросом.
 *
 * Сервер берёт не больше 200 идентификаторов и остальные молча отбрасывает —
 * у длинной ленты каталога хвост тогда выглядел бы «в наличии». Сотня с
 * запасом укладывается в предел и в длину адреса.
 */
const CHUNK_SIZE = 100

/**
 * Остатка нет — это `tracked && available <= 0`, и только так.
 *
 * `tracked=false` значит, что остаток покупку не ограничивает (например, FBO
 * при выключенном складе платформы): ноль в `available` тогда ничего не
 * говорит. Правило в одном месте, чтобы карточка, страница товара и корзина
 * не разошлись в том, что считать «нет в наличии».
 */
export const isOutOfStock = (row: ProductAvailability | undefined) =>
  Boolean(row?.tracked) && Number(row?.available ?? 0) <= 0

/**
 * Доступный остаток по списку товаров: product_id → строка из
 * /stock-operations/availability.
 *
 * Идентификаторы режутся на куски по порядку появления: лента догружается с
 * конца, поэтому уже запрошенные куски не меняются и берутся из кэша — новый
 * запрос уходит только за новой страницей товаров. Ключ тот же, что у
 * сгенерированного хука, и сброс кэша остатков после складских операций
 * задевает и эти запросы.
 */
export const useStockAvailability = (productIds: Array<number>) => {
  const chunks = useMemo(() => {
    const unique = Array.from(new Set(productIds))
    const result: Array<Array<number>> = []
    for (let i = 0; i < unique.length; i += CHUNK_SIZE) {
      result.push(unique.slice(i, i + CHUNK_SIZE))
    }
    return result
  }, [productIds])

  return useQueries({
    queries: chunks.map((ids) => {
      const options = { query: { product_ids: ids } }
      return {
        queryKey: UseGetProductsAvailabilityStockOperationsAvailabilityGetKeyFn(options),
        queryFn: () =>
          getProductsAvailabilityStockOperationsAvailabilityGet(options).then(
            (res) => res.data ?? [],
          ),
        // Остаток меняется не каждую секунду, а список листают туда-обратно.
        staleTime: 30 * 1000,
      }
    }),
    combine: toAvailabilityMap,
  })
}

// Вынесено из хука: встроенную функцию react-query перезапускает на каждом
// рендере, и карта (а с ней проверка в useOutOfStock) была бы каждый раз новой.
const toAvailabilityMap = (results: Array<{ data?: Array<ProductAvailability> }>) => {
  const byId = new Map<number, ProductAvailability>()
  for (const result of results) {
    for (const row of result.data ?? []) byId.set(row.product_id, row)
  }
  return byId
}

/**
 * Проверка «нет в наличии» для карточек списка.
 *
 * Раньше списки передавали в карточку `outOfStock={!product.is_active}` (а
 * часть — вообще ничего), и кнопка «+» оставалась живой у товара с нулевым
 * остатком: он ложился в корзину, а отказ приходил в конце оформления. Теперь
 * каждый список спрашивает остаток за те товары, что показывает, и правило у
 * всех одно. Пока остаток не пришёл, товар считается доступным — прятать
 * кнопку у всей ленты на время запроса хуже, чем редкий отказ сервера.
 */
export const useOutOfStock = (
  products: ReadonlyArray<{ id: number; is_active?: boolean | null }> | undefined,
) => {
  const productIds = useMemo(() => (products ?? []).map((product) => product.id), [products])
  const availability = useStockAvailability(productIds)

  return useCallback(
    (product: { id: number; is_active?: boolean | null }) =>
      product.is_active === false || isOutOfStock(availability.get(product.id)),
    [availability],
  )
}

/**
 * Свежий остаток одного товара для проверки перед добавлением в корзину.
 *
 * Возвращает число штук, которые можно купить, или `null`, если остаток
 * покупку не ограничивает (`tracked=false`) или узнать его не удалось. Сбой
 * сети покупку не блокирует: товар ляжет в корзину, а сервер всё равно
 * проверит остаток при оформлении — лучше так, чем «не добавляется» без причины.
 */
export const fetchStockLeft = async (
  queryClient: QueryClient,
  productId: number,
): Promise<number | null> => {
  const options = { query: { product_ids: [productId] } }
  try {
    const rows = await queryClient.fetchQuery({
      queryKey: UseGetProductsAvailabilityStockOperationsAvailabilityGetKeyFn(options),
      queryFn: () =>
        getProductsAvailabilityStockOperationsAvailabilityGet(options).then(
          (res) => res.data ?? [],
        ),
      // Решение «можно ли взять ещё одну» принимается по свежему ответу, а не
      // по кэшу страницы, открытой полчаса назад.
      staleTime: 0,
    })
    const row = rows.find((item) => item.product_id === productId)
    if (!row?.tracked) return null
    return Number(row.available)
  } catch {
    return null
  }
}
