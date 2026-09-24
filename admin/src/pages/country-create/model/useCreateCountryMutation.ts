import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { createCountryCountriesPost } from '@/shared/openapi/requests'
import type { CountryCreate } from '@/shared/openapi/requests'

export function useCreateCountryMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: CountryCreate) => createCountryCountriesPost({ body, throwOnError: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] })
      navigate('/countries')
    },
  })
}
