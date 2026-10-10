import api from '.'
import { useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'

const useGetAll = (params: Banner.API.GetAllVars) => {
  const query = useQuery<Banner.Item[], AxiosError<ApiErrorResponse>>({
    queryKey: ['get-all-banners', params],
    queryFn: async () => {
      const res = await api.req({
        method: 'GET',
        url: '/banners/',
        params,
      })

      return res.data
    },
  })

  return query
}

export const bannerApi = {
  useGetAll,
}
