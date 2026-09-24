import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { updateWarehouseWarehousesWarehouseIdPut } from '@/shared/openapi/requests'
import type { WarehouseUpdate } from '@/shared/openapi/requests'

export function useUpdateWarehouseMutation(warehouseId: number) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: WarehouseUpdate) =>
      updateWarehouseWarehousesWarehouseIdPut({
        path: { warehouse_id: warehouseId },
        body,
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] })
      navigate('/warehouses')
    },
  })
}
