import { useMutation, useQueryClient } from '@tanstack/react-query'

import { uploadBrandImageBrandsBrandIdImagePost } from '@/shared/openapi/requests'

export function useUploadBrandImageMutation(brandId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) =>
      uploadBrandImageBrandsBrandIdImagePost({
        path: { brand_id: brandId },
        body: { image: file as unknown as string },
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] })
      queryClient.invalidateQueries({ queryKey: ['brands', brandId] })
    },
  })
}
