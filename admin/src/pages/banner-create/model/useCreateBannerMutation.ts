import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import {
  createBannerBannersPost,
  uploadBannerImageBannersBannerIdImagePost,
} from '@/shared/openapi/requests'
import type { BannerCreate } from '@/shared/openapi/requests'

export function useCreateBannerMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async ({
      images,
      ...body
    }: BannerCreate & { images: Partial<Record<string, File>> }) => {
      const { data: banner } = await createBannerBannersPost({ body, throwOnError: true })
      for (const [language, file] of Object.entries(images)) {
        if (!file) continue
        await uploadBannerImageBannersBannerIdImagePost({
          path: { banner_id: banner.id },
          query: { language },
          body: { image: file as unknown as string },
          throwOnError: true,
        })
      }
      return banner
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] })
      navigate('/banners')
    },
  })
}
