import { useQuery } from '@tanstack/react-query'

import { getCountriesCountriesGet } from '@/shared/openapi/requests'

/**
 * Список стран страницами и с поиском.
 *
 * Раньше запрос брал 500 записей одной пачкой (ADMIN_LIST_LIMIT) — так список
 * хотя бы показывался целиком, но запись № 501 оставалась недостижимой, а
 * поиска не было вовсе. Теперь страница и строка поиска уходят на сервер.
 */
export function useCountriesQuery(params: { skip: number; limit: number; name?: string }) {
  return useQuery({
    queryKey: ['countries', params.skip, params.limit, params.name ?? ''],
    queryFn: () =>
      getCountriesCountriesGet({
        query: { skip: params.skip, limit: params.limit, name: params.name || undefined },
        throwOnError: true,
      }),
  })
}
