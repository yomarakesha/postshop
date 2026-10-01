import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { getErrorMessage, isApiError } from '@/shared/lib/apiError'
import {
  type WarehouseType,
  updateShopAdditionalShopAdditionalsShopAdditionalIdPut,
} from '@/shared/openapi/requests'

/**
 * Причины отказа из ответа 409 и ключи их перевода.
 *
 * Сервер перечисляет их по-английски одной строкой: «…Now: open orders: 2;
 * draft stock receipts: 1». Общий обработчик показывал её как есть, с
 * приставкой «Уже существует:» от кода 409 — сотрудник не понимал ни что
 * мешает, ни что с этим делать.
 */
const BLOCKERS: [RegExp, string][] = [
  [/open orders: (\d+)/, 'stores.warehouseTypeBlockers.openOrders'],
  [/draft stock receipts: (\d+)/, 'stores.warehouseTypeBlockers.draftReceipts'],
  [/products with own \(FBS\) stock: (\d+)/, 'stores.warehouseTypeBlockers.fbsStock'],
  [/products at the platform warehouse \(FBO\): (\d+)/, 'stores.warehouseTypeBlockers.fboStock'],
]

/**
 * Смена типа склада магазина.
 *
 * Продавец выбирает тип один раз, при активации, и сам сменить его не может:
 * от типа зависит, где лежит товар и откуда списываются заказы. Раньше тип
 * в админке только показывался, и сменить его было негде вовсе — а если
 * платформа выключает склад, магазины FBO надо переводить на FBS.
 */
export function useChangeWarehouseTypeMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({
      shopAdditionalId,
      warehouseType,
    }: {
      shopAdditionalId: number
      warehouseType: WarehouseType
    }) =>
      updateShopAdditionalShopAdditionalsShopAdditionalIdPut({
        path: { shop_additional_id: shopAdditionalId },
        body: { warehouse_type: warehouseType },
        throwOnError: true,
      }),
    onSuccess: () => {
      toast.success(t('stores.warehouseTypeChanged'))
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ['stores'] }),
        queryClient.invalidateQueries({ queryKey: ['shop-bases'] }),
      ])
    },
    // onError объявлен здесь, а не в mutate(): переданный в mutate() живёт
    // отдельно, и глобальный обработчик MutationCache показывал второй тост
    // с тем же отказом.
    onError: (error) => {
      if (!isApiError(error) || error.status !== 409 || !error.detail) {
        toast.error(getErrorMessage(error))
        return
      }
      const detail = error.detail
      const reasons = BLOCKERS.flatMap(([pattern, key]) => {
        const count = pattern.exec(detail)?.[1]
        return count ? [t(key, { count: Number(count) })] : []
      })
      toast.error(t('stores.warehouseTypeBlocked'), {
        // Без распознанных причин — хотя бы текст сервера, а не пустота.
        description: reasons.length > 0 ? reasons.join('; ') : detail,
        duration: 15_000,
      })
    },
  })
}
