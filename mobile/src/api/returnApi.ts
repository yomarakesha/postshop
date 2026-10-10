import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import api from '.'
import { MAX_PAGE_SIZE } from '@/constants/pagination'

const MY_RETURNS_KEY = 'my-returns'

/**
 * Возвраты по товарам магазина — глазами продавца. Решение по заявке
 * принимает платформа; продавец FBS только отмечает, что товар к нему
 * вернулся (см. useReceive).
 */
const useShopReturns = (shopBaseId: number) =>
  useQuery<ReturnRequest.Item[], AxiosError<ApiErrorResponse>>({
    queryKey: ['shop-returns', shopBaseId],
    queryFn: async () => {
      const res = await api.req({
        method: 'GET',
        url: `/returns/shop/${shopBaseId}`,
        params: { limit: MAX_PAGE_SIZE },
      })
      return res.data
    },
    enabled: !!shopBaseId,
  })

/**
 * Товар по одобренному возврату вернулся к продавцу FBS.
 *
 * Одобрение заявки больше не трогает остаток: товар ещё в пути, и вернуть
 * его в продажу можно только когда он на полке и цел. restock=true — снова в
 * продаже, false — брак. Возврат FBO получает склад Postshop, продавцу сервер
 * ответит 403 — кнопок для FBO в приложении нет.
 */
const useReceive = (shopBaseId: number) => {
  const queryClient = useQueryClient()
  return useMutation<
    ReturnRequest.Item,
    AxiosError<ApiErrorResponse>,
    { id: number } & ReturnRequest.API.ReceiveBody
  >({
    mutationFn: async ({ id, restock }) => {
      const res = await api.req({
        method: 'PATCH',
        url: `/returns/${id}/receive`,
        data: { restock },
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-returns', shopBaseId] })
    },
  })
}

/**
 * Свои заявки покупателя — чтобы у товара в заказе показать, что возврат уже
 * запрошен, вместо кнопки, на которую сервер ответит «уже в работе».
 */
const useMyReturns = (enabled = true) =>
  useQuery<ReturnRequest.Item[], AxiosError<ApiErrorResponse>>({
    queryKey: [MY_RETURNS_KEY],
    queryFn: async () => {
      const res = await api.req({ method: 'GET', url: '/returns/my' })
      return res.data
    },
    enabled,
  })

/** Заявка покупателя на возврат купленного товара (только завершённый заказ). */
const useCreate = () => {
  const queryClient = useQueryClient()
  return useMutation<
    ReturnRequest.Item,
    AxiosError<ApiErrorResponse>,
    ReturnRequest.API.CreateBody
  >({
    mutationFn: async (data) => {
      const res = await api.req({ method: 'POST', url: '/returns/', data })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MY_RETURNS_KEY] })
    },
  })
}

/**
 * Отозвать свою заявку, пока её не рассмотрели. На витрине это было, в
 * приложении — нет: ошибочную заявку оставалось только ждать.
 */
const useCancel = () => {
  const queryClient = useQueryClient()
  return useMutation<void, AxiosError<ApiErrorResponse>, number>({
    mutationFn: async (id) => {
      await api.req({ method: 'DELETE', url: `/returns/${id}` })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MY_RETURNS_KEY] })
    },
  })
}

export const returnApi = {
  useShopReturns,
  useReceive,
  useMyReturns,
  useCreate,
  useCancel,
}
