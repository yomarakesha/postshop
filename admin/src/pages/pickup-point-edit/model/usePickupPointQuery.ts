import { useQuery } from '@tanstack/react-query'

import { getPickupPointPickupPointsPickupPointIdGet } from '@/shared/openapi/requests'

export function usePickupPointQuery(pickupPointId: number) {
  return useQuery({
    queryKey: ['pickup-points', pickupPointId],
    queryFn: () =>
      getPickupPointPickupPointsPickupPointIdGet({
        path: { pickup_point_id: pickupPointId },
        throwOnError: true,
      }),
  })
}
