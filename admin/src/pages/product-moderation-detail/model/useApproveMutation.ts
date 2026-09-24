import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { approveProductProductsProductIdApprovePatch } from '@/shared/openapi/requests'

export function useApproveMutation(productId: number) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () =>
      approveProductProductsProductIdApprovePatch({
        path: { product_id: productId },
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'moderation'] })
      queryClient.invalidateQueries({ queryKey: ['products', 'moderation-count'] })
      queryClient.invalidateQueries({ queryKey: ['products', productId] })
      navigate('/product-moderation')
    },
  })
}
