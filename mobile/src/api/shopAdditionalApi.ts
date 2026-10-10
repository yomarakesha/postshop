import {
  useInfiniteQuery,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query'
import api from '.'
import { AxiosError } from 'axios'
import { buildMultipartFromBody } from '@/utils/buildMultipartFromBody'

type GetAllOptions = Omit<
  UseQueryOptions<ShopAdditional.Item[], AxiosError<ApiErrorResponse>>,
  'queryKey' | 'queryFn'
>

const useGetAll = (params: ShopAdditional.API.GetAllVars, options?: GetAllOptions) => {
  const query = useQuery<ShopAdditional.Item[], AxiosError<ApiErrorResponse>>({
    queryKey: ['shop-additional', params],
    queryFn: async () => {
      const response = await api.req({
        method: 'GET',
        url: '/shop-additionals/',
        params,
      })
      return response.data
    },
    ...options,
  })

  return query
}

const useGetInfiniteList = (params: ShopAdditional.API.GetAllVars, options?: GetAllOptions) => {
  const limit = params.limit ?? 10

  const query = useInfiniteQuery({
    initialPageParam: 0,
    queryKey: ['shop-additional-infinite', params],
    queryFn: async ({ pageParam }) => {
      const res = await api.req({
        method: 'GET',
        url: '/shop-additionals/',
        params: {
          ...params,
          skip: pageParam,
          limit,
          ...options,
        },
      })

      return res.data
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.length < limit) return undefined
      return lastPageParam + limit
    },
  })

  return query
}

type GetOneOptions = Omit<
  UseQueryOptions<ShopAdditional.Item, AxiosError<ApiErrorResponse>>,
  'queryKey' | 'queryFn'
>

const useGet = (shopBaseId: number, options?: GetOneOptions) => {
  const query = useQuery<ShopAdditional.Item, AxiosError<ApiErrorResponse>>({
    queryKey: ['shop-additional', shopBaseId],
    queryFn: async () => {
      const response = await api.req({
        method: 'GET',
        url: `/shop-additionals/by-shop/${shopBaseId}`,
      })
      return response.data
    },
    ...options,
  })

  return query
}

//
const useCreate = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation<
    undefined,
    AxiosError<ApiErrorResponse>,
    ShopAdditional.API.CreateBody
  >({
    mutationKey: ['shop-additional-create'],
    mutationFn: async (data) => {
      const { body, contentType } = await buildMultipartFromBody(data)
      const response = await api.req({
        method: 'POST',
        url: '/shop-additionals/',
        data: body,
        headers: {
          'Content-Type': contentType,
        },
        transformRequest: (d) => d,
      })

      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-additional'] })
    },
  })

  return mutation
}

type GetByIdsOptions = Omit<
  UseQueryOptions<ShopAdditional.Item, AxiosError<ApiErrorResponse>>,
  'queryKey' | 'queryFn'
>

type QueryResult = {
  data: (ShopAdditional.Item | undefined)[]
  isLoading: boolean
  // Корзина обязана отличать «пусто» от «не загрузилось»: без этого
  // ошибка сети выглядела как пустая корзина.
  isError: boolean
}

const useGetByShopBaseIds = (shopBaseIds: number[], options?: GetByIdsOptions) => {
  const query = useQueries({
    queries: shopBaseIds.map((shopBaseId) => ({
      queryKey: ['get-shop-base', shopBaseId] as const,
      queryFn: async (): Promise<ShopAdditional.Item> => {
        const res = await api.req<ShopAdditional.Item>({
          method: 'GET',
          url: `/shop-additionals/by-shop/${shopBaseId}`,
        })
        return res.data
      },
    })),
    combine: (results): QueryResult => {
      return {
        data: results.map((r) => r.data),
        isLoading: results.some((r) => r.isLoading),
        isError: results.some((r) => r.isError),
      }
    },
  })
  return query
}

const useGetByShopBaseId = (shopBaseId: number, options?: GetOneOptions) => {
  const query = useQuery<ShopAdditional.Item, AxiosError<ApiErrorResponse>>({
    queryKey: ['shop-additional', shopBaseId],
    queryFn: async () => {
      const response = await api.req({
        method: 'GET',
        url: `/shop-additionals/by-shop/${shopBaseId}`,
      })
      return response.data
    },
    ...options,
  })

  return query
}

const useUpdate = (shopAdditionalId: number) => {
  const queryClient = useQueryClient()
  const mutaiton = useMutation<
    undefined,
    AxiosError<ApiErrorResponse>,
    ShopAdditional.API.UpdateBody
  >({
    mutationKey: ['update-shop-additional'],
    mutationFn: async (data) => {
      // Тем же сборщиком, что и создание: FormData с {uri,name,type} на
      // React Native 0.83+ отправляет пустую часть файла, и логотип при
      // правке магазина не доходил до сервера.
      const { body, contentType } = await buildMultipartFromBody(data)
      const response = await api.req({
        method: 'PUT',
        url: `/shop-additionals/${shopAdditionalId}`,
        data: body,
        headers: {
          'Content-Type': contentType,
        },
        transformRequest: (d) => d,
      })

      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['shop-additional', shopAdditionalId],
      })
    },
  })

  return mutaiton
}

export const shopAdditionalApi = {
  useGetAll,
  useGet,
  useCreate,
  useGetByShopBaseIds,
  useGetInfiniteList,
  useUpdate,
  useGetByShopBaseId,
}
