import { useModerateProductMutation } from '@/shared/hooks/useModerateProductMutation'

export function useDeclineMutation() {
  return useModerateProductMutation('declined')
}
