import { useQuery } from '@tanstack/react-query'

import { getWarehouseWarehousesWarehouseIdGet } from '@/shared/openapi/requests'

export function useWarehouseQuery(warehouseId: number) {
  return useQuery({
    queryKey: ['warehouses', warehouseId],
    queryFn: () =>
      getWarehouseWarehousesWarehouseIdGet({
        path: { warehouse_id: warehouseId },
        throwOnError: true,
      }),
  })
}
