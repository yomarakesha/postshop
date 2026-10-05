import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createWarehouseOperationWarehouseOperationsPost } from '@/shared/openapi/requests'

/** Расход со склада, который оформляет сотрудник. */
export type OutgoKind = 'write_off' | 'return_to_shop'

interface Params {
  warehouseId: number
  shopId: number
  productId: number
  measureUnitId: number
  kind: OutgoKind
  quantity: string
}

/**
 * Списать брак или вернуть товар магазину.
 *
 * Сервер это умел, а экрана не было: брак на складе оставался в остатке,
 * магазин не мог забрать свой товар — и, пока остаток не обнулён, не мог
 * сменить тип склада. Сервер не даст списать то, что держат открытые заказы.
 */
export function useWarehouseOutgoMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ warehouseId, shopId, productId, measureUnitId, kind, quantity }: Params) =>
      createWarehouseOperationWarehouseOperationsPost({
        body: {
          warehouse_id: warehouseId,
          shop_id: shopId,
          product_id: productId,
          measure_unit_id: measureUnitId,
          operation_type: kind,
          quantity,
        },
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouse-balances'] })
    },
  })
}
