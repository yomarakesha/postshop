import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { updateBannerBannersBannerIdPut } from '@/shared/openapi/requests'
import type { BannerUpdate } from '@/shared/openapi/requests'

export function useUpdateBannerMutation(bannerId: number) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: BannerUpdate) =>
      updateBannerBannersBannerIdPut({
        path: { banner_id: bannerId },
        body,
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] })
      navigate('/banners')
    },
  })
}
