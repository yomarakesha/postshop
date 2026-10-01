import { useModerateProductMutation } from '@/shared/hooks/useModerateProductMutation'

export function useApproveMutation() {
  return useModerateProductMutation('approved')
}
