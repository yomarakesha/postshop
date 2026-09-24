import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { declineProductProductsProductIdDeclinePatch } from '@/shared/openapi/requests'

export function useDeclineMutation(productId: number) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () =>
      declineProductProductsProductIdDeclinePatch({
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
