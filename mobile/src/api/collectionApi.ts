import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import api from '.'
import { AxiosError } from 'axios'

const useGetAll = (params: Collection.API.GetAllVars) => {
  const query = useQuery<Collection.Item[], AxiosError<ApiErrorResponse>>({
    queryKey: ['collections'],
    queryFn: async () => {
      const res = await api.req({
        method: 'GET',
        url: '/collections/',
        params,
      })

      return res.data
    },
  })
  return query
}

type GetOptions = Omit<
  UseQueryOptions<Collection.Item, AxiosError<ApiErrorResponse>>,
  'queryKey' | 'queryFn'
>
const useGet = (collectionId: number, options: GetOptions) => {
  const query = useQuery<Collection.Item, AxiosError<ApiErrorResponse>>({
    queryKey: ['collections', collectionId],
    queryFn: async () => {
      const res = await api.req({
        method: 'GET',
        url: `/collections/${collectionId}`,
      })

      return res.data
    },
    ...options,
  })
  return query
}

export const collectionApi = {
  useGetAll,
  useGet,
}
