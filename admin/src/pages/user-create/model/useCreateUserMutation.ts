import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { createUserUsersPost } from '@/shared/openapi/requests'
import type { UserCreateRequest } from '@/shared/openapi/requests'

export function useCreateUserMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: UserCreateRequest) => createUserUsersPost({ body, throwOnError: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      navigate('/users')
    },
  })
}
