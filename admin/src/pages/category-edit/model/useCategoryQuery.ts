import { useQuery } from '@tanstack/react-query'

import { getCategoryCategoriesCategoryIdGet } from '@/shared/openapi/requests'

export function useCategoryQuery(categoryId: number) {
  return useQuery({
    queryKey: ['categories', categoryId],
    queryFn: () =>
      getCategoryCategoriesCategoryIdGet({
        path: { category_id: categoryId },
        throwOnError: true,
      }),
  })
}
