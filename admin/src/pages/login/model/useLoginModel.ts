import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { LocalStorage } from '@/shared/lib/LocalStorage'
import { loginAuthLoginPost } from '@/shared/openapi/requests'
import { useProfileStore } from '@/shared/store/profileStore'

export const useLoginModel = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const clearProfile = useProfileStore((s) => s.clearProfile)

  const mutation = useMutation({
    mutationFn: (data: { username: string; password: string }) =>
      loginAuthLoginPost({
        body: { username: data.username, password: data.password },
        throwOnError: true,
      }),
    onSuccess: (res) => {
      LocalStorage.set('access_token', res.data.access_token)
      LocalStorage.set('refresh_token', res.data.refresh_token)
      clearProfile()
      queryClient.removeQueries({ queryKey: ['auth'] })
      navigate('/')
    },
  })

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    onSubmit: ({ value }) => {
      mutation.mutate(value)
    },
  })

  return { form, mutation }
}
