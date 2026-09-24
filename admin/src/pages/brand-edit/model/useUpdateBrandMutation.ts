import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { updateBrandBrandsBrandIdPut } from '@/shared/openapi/requests'
import type { BrandUpdate } from '@/shared/openapi/requests'

export function useUpdateBrandMutation(brandId: number) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: BrandUpdate) =>
      updateBrandBrandsBrandIdPut({
        path: { brand_id: brandId },
        body,
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] })
      navigate('/brands')
    },
  })
}
