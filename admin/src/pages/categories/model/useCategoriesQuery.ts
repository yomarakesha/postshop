import { useQuery } from '@tanstack/react-query'

import { getCategoriesCategoriesGet } from '@/shared/openapi/requests'

/**
 * Список категорий страницами и с поиском.
 *
 * Раньше запрос брал 500 записей одной пачкой: список хотя бы показывался
 * целиком (до этого обрезался на двадцати, и шесть последних категорий не
 * появлялись нигде), но запись № 501 оставалась недостижимой.
 */
export function useCategoriesQuery(params: { skip: number; limit: number; search?: string }) {
  return useQuery({
    queryKey: ['categories', params.skip, params.limit, params.search ?? ''],
    queryFn: () =>
      getCategoriesCategoriesGet({
        query: { skip: params.skip, limit: params.limit, search: params.search || undefined },
        throwOnError: true,
      }),
  })
}
