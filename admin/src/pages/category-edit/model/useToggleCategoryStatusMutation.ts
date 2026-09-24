import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  blockCategoryCategoriesCategoryIdBlockPatch,
  unblockCategoryCategoriesCategoryIdUnblockPatch,
} from '@/shared/openapi/requests'

export function useToggleCategoryStatusMutation(categoryId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (isActive: boolean) => {
      const action = isActive
        ? blockCategoryCategoriesCategoryIdBlockPatch
        : unblockCategoryCategoriesCategoryIdUnblockPatch

      return action({
        path: { category_id: categoryId },
        throwOnError: true,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}
