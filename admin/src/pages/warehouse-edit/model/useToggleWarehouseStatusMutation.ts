import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  blockWarehouseWarehousesWarehouseIdBlockPatch,
  unblockWarehouseWarehousesWarehouseIdUnblockPatch,
} from '@/shared/openapi/requests'

export function useToggleWarehouseStatusMutation(warehouseId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (isActive: boolean) => {
      const action = isActive
        ? blockWarehouseWarehousesWarehouseIdBlockPatch
        : unblockWarehouseWarehousesWarehouseIdUnblockPatch

      return action({
        path: { warehouse_id: warehouseId },
        throwOnError: true,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] })
    },
  })
}
