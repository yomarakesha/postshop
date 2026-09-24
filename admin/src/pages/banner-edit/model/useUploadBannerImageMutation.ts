import { useMutation, useQueryClient } from '@tanstack/react-query'

import { uploadBannerImageBannersBannerIdImagePost } from '@/shared/openapi/requests'

export function useUploadBannerImageMutation(bannerId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ file, language }: { file: File; language: string }) =>
      uploadBannerImageBannersBannerIdImagePost({
        path: { banner_id: bannerId },
        query: { language },
        body: { image: file as unknown as string },
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] })
      queryClient.invalidateQueries({ queryKey: ['banners', bannerId] })
    },
  })
}
