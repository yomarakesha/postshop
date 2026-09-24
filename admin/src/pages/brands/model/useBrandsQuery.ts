import { useQuery } from '@tanstack/react-query'

import { getBrandsBrandsGet } from '@/shared/openapi/requests'

/**
 * Список страницами и с поиском на стороне сервера.
 *
 * Раньше запрос брал 500 записей одной пачкой: список хотя бы показывался
 * целиком, но запись № 501 оставалась недостижимой, а кнопок перехода по
 * страницам не было ни на одной странице админки.
 */
export function useBrandsQuery(params: { skip: number; limit: number; name?: string }) {
  return useQuery({
    queryKey: ['brands', params.skip, params.limit, params.name ?? ''],
    queryFn: () =>
      getBrandsBrandsGet({
        query: { skip: params.skip, limit: params.limit, name: params.name || undefined },
        throwOnError: true,
      }),
  })
}
