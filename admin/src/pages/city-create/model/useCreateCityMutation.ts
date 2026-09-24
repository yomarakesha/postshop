import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { createCityCitiesPost } from '@/shared/openapi/requests'
import type { CityCreate } from '@/shared/openapi/requests'

export function useCreateCityMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: CityCreate) => createCityCitiesPost({ body, throwOnError: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] })
      navigate('/cities')
    },
  })
}
