import { useQuery } from '@tanstack/react-query'

import { readDeliveryMessageDeliveryMessageGet } from '@/shared/openapi/requests'

export function useDeliveryMessageQuery() {
  return useQuery({
    queryKey: ['delivery-message'],
    queryFn: async () => {
      const res = await readDeliveryMessageDeliveryMessageGet()
      if (res.error) return { data: null }
      return res
    },
  })
}
