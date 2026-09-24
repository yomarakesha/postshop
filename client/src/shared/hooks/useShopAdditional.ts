import { useQuery } from '@tanstack/react-query'
import { getShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGet } from '#/shared/openapi/requests/sdk.gen'
import { UseGetShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGetKeyFn } from '#/shared/openapi/queries/common'

/**
 * Карточка магазина (название, логотип, контакты).
 *
 * Сервер отвечает 404, если владелец ещё не заполнил карточку. Для нового
 * магазина это нормальное состояние, а не ошибка, поэтому сгенерированный хук
 * здесь не подходит: он получает `undefined` и роняет запрос сообщением
 * «Query data cannot be undefined». Обёртка возвращает `null` — «карточки пока
 * нет» — и не засоряет консоль.
 */
export const useShopAdditional = (shopBaseId: number, enabled = true) => {
  const clientOptions = { path: { shop_base_id: shopBaseId } }

  return useQuery({
    queryKey: UseGetShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGetKeyFn(clientOptions),
    enabled: enabled && Number.isFinite(shopBaseId),
    retry: false,
    queryFn: async () => {
      const response = await getShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGet({
        ...clientOptions,
        throwOnError: false,
      })
      return response.data ?? null
    },
  })
}
