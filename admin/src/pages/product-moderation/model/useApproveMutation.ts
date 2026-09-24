import { useMutation, useQueryClient } from '@tanstack/react-query'

import { approveProductProductsProductIdApprovePatch } from '@/shared/openapi/requests'

export function useApproveMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: number) =>
      approveProductProductsProductIdApprovePatch({
        path: { product_id: productId },
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'moderation'] })
      queryClient.invalidateQueries({ queryKey: ['products', 'moderation-count'] })
    },
  })
}
