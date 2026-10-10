import { useMutation, useQuery } from '@tanstack/react-query'
import api from '.'
import { AxiosError } from 'axios'

const useGetMe = () => {
  const query = useQuery<User.Item, AxiosError<ApiErrorResponse>, undefined>({
    queryKey: ['get-me'],
    queryFn: async () => {
      const response = await api.req({
        method: 'GET',
        url: '/auth/me',
      })

      return response.data
    },
  })

  return query
}

const useUpdate = (userId: number) => {
  const mutation = useMutation<undefined, AxiosError<ApiErrorResponse>, User.Form.CreateUpdate>({
    mutationKey: ['update-profile'],
    mutationFn: async (data) => {
      const response = await api.req({
        method: 'PUT',
        url: `/users/${userId}`,
        data,
      })

      return response.data
    },
  })

  return mutation
}

const useGetById = (userId: number) => {
  const query = useQuery<User.Item, AxiosError<ApiErrorResponse>>({
    queryKey: ['user-get-by-id', userId],
    queryFn: async () => {
      const response = await api.req({
        method: 'GET',
        url: `/users/${userId}`,
      })
      return response.data
    },
    enabled: !!userId,
  })
  return query
}

export const userApi = {
  useGetMe,
  useUpdate,
  useGetById,
}
