import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { updateCategoryCategoriesCategoryIdPut } from '@/shared/openapi/requests'
import type { CategoryUpdate } from '@/shared/openapi/requests'

export function useUpdateCategoryMutation(categoryId: number) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: CategoryUpdate) =>
      updateCategoryCategoriesCategoryIdPut({
        path: { category_id: categoryId },
        body,
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      navigate('/categories')
    },
  })
}
