import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import {
  createBrandBrandsPost,
  uploadBrandImageBrandsBrandIdImagePost,
} from '@/shared/openapi/requests'
import type { BrandCreate } from '@/shared/openapi/requests'

export function useCreateBrandMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async ({ image, ...body }: BrandCreate & { image?: File | null }) => {
      const { data: brand } = await createBrandBrandsPost({ body, throwOnError: true })
      if (image) {
        await uploadBrandImageBrandsBrandIdImagePost({
          path: { brand_id: brand.id },
          body: { image: image as unknown as string },
          throwOnError: true,
        })
      }
      return brand
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] })
      navigate('/brands')
    },
  })
}
