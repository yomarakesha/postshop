import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { updateCountryCountriesCountryIdPut } from '@/shared/openapi/requests'
import type { CountryUpdate } from '@/shared/openapi/requests'

export function useUpdateCountryMutation(countryId: number) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: CountryUpdate) =>
      updateCountryCountriesCountryIdPut({
        path: { country_id: countryId },
        body,
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] })
      navigate('/countries')
    },
  })
}
