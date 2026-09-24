import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  blockBrandBrandsBrandIdBlockPatch,
  unblockBrandBrandsBrandIdUnblockPatch,
} from '@/shared/openapi/requests'

export function useToggleBrandStatusMutation(brandId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (isActive: boolean) => {
      const action = isActive
        ? blockBrandBrandsBrandIdBlockPatch
        : unblockBrandBrandsBrandIdUnblockPatch

      return action({
        path: { brand_id: brandId },
        throwOnError: true,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] })
    },
  })
}
