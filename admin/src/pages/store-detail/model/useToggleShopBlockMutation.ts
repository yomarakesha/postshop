import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  blockShopBaseShopBasesShopIdBlockPatch,
  unblockShopBaseShopBasesShopIdUnblockPatch,
} from '@/shared/openapi/requests'

export function useToggleShopBlockMutation(shopId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (isActive: boolean) =>
      isActive
        ? blockShopBaseShopBasesShopIdBlockPatch({
            path: { shop_id: shopId },
            throwOnError: true,
          })
        : unblockShopBaseShopBasesShopIdUnblockPatch({
            path: { shop_id: shopId },
            throwOnError: true,
          }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] })
      queryClient.invalidateQueries({ queryKey: ['shop-bases'] })
    },
  })
}
