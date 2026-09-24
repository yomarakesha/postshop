import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { createCurrencyCurrenciesPost } from '@/shared/openapi/requests'
import type { CurrencyCreate } from '@/shared/openapi/requests'

export function useCreateCurrencyMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: CurrencyCreate) =>
      createCurrencyCurrenciesPost({ body, throwOnError: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] })
      navigate('/currencies')
    },
  })
}
