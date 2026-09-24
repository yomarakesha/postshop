import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { createCollectionCollectionsPost } from '@/shared/openapi/requests'
import type { CollectionCreate } from '@/shared/openapi/requests'

export function useCreateCollectionMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: CollectionCreate) =>
      createCollectionCollectionsPost({ body, throwOnError: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
      navigate('/collections')
    },
  })
}
