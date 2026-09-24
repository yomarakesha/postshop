import { useQuery } from '@tanstack/react-query'

import { ADMIN_LIST_LIMIT } from '@/shared/constants/pagination'
import { getMeasureUnitsMeasureUnitsGet } from '@/shared/openapi/requests'

export function useMeasureUnitsQuery() {
  return useQuery({
    queryKey: ['measure-units'],
    queryFn: () =>
      getMeasureUnitsMeasureUnitsGet({ query: { limit: ADMIN_LIST_LIMIT }, throwOnError: true }),
  })
}
