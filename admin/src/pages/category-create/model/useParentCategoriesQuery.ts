import { useQuery } from '@tanstack/react-query'

import { ADMIN_LIST_LIMIT } from '@/shared/constants/pagination'
import { getCategoriesCategoriesGet } from '@/shared/openapi/requests'

export function useParentCategoriesQuery() {
  const { data, ...rest } = useQuery({
    queryKey: ['categories', 'parents'],
    queryFn: () =>
      getCategoriesCategoriesGet({
        query: { only_parents: true, limit: ADMIN_LIST_LIMIT },
        throwOnError: true,
      }),
  })

  return { parentCategories: data?.data ?? [], ...rest }
}
