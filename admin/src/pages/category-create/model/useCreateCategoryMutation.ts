import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import {
  createCategoryCategoriesPost,
  uploadCategoryImageCategoriesCategoryIdImagePost,
} from '@/shared/openapi/requests'
import type { CategoryCreate } from '@/shared/openapi/requests'

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async ({ image, ...body }: CategoryCreate & { image?: File | null }) => {
      const { data: category } = await createCategoryCategoriesPost({ body, throwOnError: true })
      if (image) {
        await uploadCategoryImageCategoriesCategoryIdImagePost({
          path: { category_id: category.id },
          body: { image: image as unknown as string },
          throwOnError: true,
        })
      }
      return category
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      navigate('/categories')
    },
  })
}
