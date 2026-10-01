import { useNavigate } from 'react-router-dom'

import { useModerateProductMutation } from '@/shared/hooks/useModerateProductMutation'

export function useDeclineMutation() {
  const navigate = useNavigate()
  return useModerateProductMutation('declined', { onDone: () => navigate('/product-moderation') })
}
