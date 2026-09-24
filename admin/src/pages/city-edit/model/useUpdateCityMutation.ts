import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { updateCityCitiesCityIdPut } from '@/shared/openapi/requests'
import type { CityUpdate } from '@/shared/openapi/requests'

export function useUpdateCityMutation(cityId: number) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: CityUpdate) =>
      updateCityCitiesCityIdPut({
        path: { city_id: cityId },
        body,
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] })
      navigate('/cities')
    },
  })
}
