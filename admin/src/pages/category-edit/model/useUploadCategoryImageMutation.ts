import { useMutation, useQueryClient } from '@tanstack/react-query'

import { uploadCategoryImageCategoriesCategoryIdImagePost } from '@/shared/openapi/requests'

export function useUploadCategoryImageMutation(categoryId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) =>
      uploadCategoryImageCategoriesCategoryIdImagePost({
        path: { category_id: categoryId },
        body: { image: file as unknown as string },
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories', categoryId] })
    },
  })
}
