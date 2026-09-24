import { useQuery } from '@tanstack/react-query'

import { getMeasureUnitMeasureUnitsUnitIdGet } from '@/shared/openapi/requests'

export function useMeasureUnitQuery(unitId: number) {
  return useQuery({
    queryKey: ['measure-units', unitId],
    queryFn: () =>
      getMeasureUnitMeasureUnitsUnitIdGet({
        path: { unit_id: unitId },
        throwOnError: true,
      }),
  })
}
