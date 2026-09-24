import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  blockUserUsersUserIdBlockPatch,
  unblockUserUsersUserIdUnblockPatch,
} from '@/shared/openapi/requests'

export function useToggleUserStatusMutation(userId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (isActive: boolean) => {
      const action = isActive ? blockUserUsersUserIdBlockPatch : unblockUserUsersUserIdUnblockPatch

      return action({
        path: { user_id: userId },
        throwOnError: true,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
