import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { updateUserUsersUserIdPut } from '@/shared/openapi/requests'
import type { UserUpdateRequest } from '@/shared/openapi/requests'

export function useUpdateUserMutation(userId: number) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: UserUpdateRequest) =>
      updateUserUsersUserIdPut({
        path: { user_id: userId },
        body,
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      navigate('/users')
    },
  })
}
