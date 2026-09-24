import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  blockBannerBannersBannerIdBlockPatch,
  unblockBannerBannersBannerIdUnblockPatch,
} from '@/shared/openapi/requests'

export function useToggleBannerStatusMutation(bannerId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (isActive: boolean) => {
      const action = isActive
        ? blockBannerBannersBannerIdBlockPatch
        : unblockBannerBannersBannerIdUnblockPatch

      return action({
        path: { banner_id: bannerId },
        throwOnError: true,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] })
    },
  })
}
