import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  type WarehouseType,
  updateShopAdditionalShopAdditionalsShopAdditionalIdPut,
} from '@/shared/openapi/requests'

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
      queryClient.invalidateQueries({ queryKey: ['stores'] })
      queryClient.invalidateQueries({ queryKey: ['shop-bases'] })
    },
  })
}
