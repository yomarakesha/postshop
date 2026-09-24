import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { createWarehouseWarehousesPost } from '@/shared/openapi/requests'
import type { WarehouseCreate } from '@/shared/openapi/requests'

export function useCreateWarehouseMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: WarehouseCreate) =>
      createWarehouseWarehousesPost({ body, throwOnError: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] })
      navigate('/warehouses')
    },
  })
}
