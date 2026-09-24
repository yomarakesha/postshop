import { useQuery } from '@tanstack/react-query'

import { getWarehouseBalancesWarehouseOperationsWarehouseWarehouseIdBalancesGet } from '@/shared/openapi/requests'

/**
 * Остатки товаров на складе.
 *
 * Таблица «Товары на складе» была строкой-заглушкой без запроса и всегда
 * сообщала, что склад пуст — независимо от настоящих остатков. Поштучного
 * опроса по каждому товару для списка не хватало, поэтому на бэкенде появился
 * метод сводки: GET /warehouse-operations/warehouse/{id}/balances.
 */
export function useWarehouseBalancesQuery(warehouseId: number, name?: string) {
  return useQuery({
    queryKey: ['warehouse-balances', warehouseId, name ?? ''],
    queryFn: () =>
      getWarehouseBalancesWarehouseOperationsWarehouseWarehouseIdBalancesGet({
        path: { warehouse_id: warehouseId },
        query: { limit: 100, name: name || undefined },
      }),
    enabled: Number.isFinite(warehouseId),
  })
}
