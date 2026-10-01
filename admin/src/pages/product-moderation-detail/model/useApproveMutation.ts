import { useNavigate } from 'react-router-dom'

import { useModerateProductMutation } from '@/shared/hooks/useModerateProductMutation'

export function useApproveMutation() {
  const navigate = useNavigate()
  return useModerateProductMutation('approved', { onDone: () => navigate('/product-moderation') })
}
