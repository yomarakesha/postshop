import { useMutation, useQueryClient } from '@tanstack/react-query'

import { declineProductProductsProductIdDeclinePatch } from '@/shared/openapi/requests'

export function useDeclineMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: number) =>
      declineProductProductsProductIdDeclinePatch({
        path: { product_id: productId },
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'moderation'] })
      queryClient.invalidateQueries({ queryKey: ['products', 'moderation-count'] })
    },
  })
}
