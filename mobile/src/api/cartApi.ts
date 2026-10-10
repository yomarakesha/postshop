import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import api from '.'
import { AxiosError } from 'axios'

type GetAllOptions = Omit<
  UseQueryOptions<Cart.API.GetAllResponse, AxiosError<ApiErrorResponse>>,
  'queryKey' | 'queryFn'
>

const useGetAll = (options?: GetAllOptions) => {
  const query = useQuery<Cart.API.GetAllResponse, AxiosError<ApiErrorResponse>>({
    queryKey: ['get-all-carts'],
    queryFn: async () => {
      const res = await api.req({
        method: 'GET',
        url: '/cart/',
      })

      return res.data
    },
    ...options,
  })

  return query
}

const useAdd = () => {
  const queryClient = useQueryClient()
  const query = useMutation<undefined, AxiosError<ApiErrorResponse>, Cart.API.AddBody>({
    mutationKey: ['add-to-cart'],
    mutationFn: async (data) => {
      const res = await api.req({
        method: 'POST',
        url: '/cart/',
        data,
      })

      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-carts'] })
    },
  })

  return query
}

const useUpdateQuantity = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation<
    undefined,
    AxiosError<ApiErrorResponse>,
    { quantity: number; productId: number }
  >({
    mutationFn: async ({ productId, quantity }) => {
      const res = await api.req({
        method: 'PUT',
        url: `/cart/${productId}`,
        data: { quantity },
      })

      return res.data
    },
    onMutate: async ({ productId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['get-all-carts'] })
      const previous = queryClient.getQueryData(['get-all-carts'])
      queryClient.setQueryData(['get-all-carts'], (old: Cart.API.GetAllResponse | undefined) => {
        if (!old) return old
        return {
          ...old,
          groups: old.groups.map((group) => ({
            ...group,
            items: group.items.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item,
            ),
          })),
        }
      })
      return { previous }
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(['get-all-carts'], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-carts'] })
    },
  })

  return mutation
}

const useClear = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation<undefined, AxiosError<ApiErrorResponse>>({
    mutationFn: async () => {
      const res = await api.req({
        method: 'DELETE',
        url: '/cart/',
      })

      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-carts'] })
    },
  })

  return mutation
}

const useRemoveItem = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation<undefined, AxiosError<ApiErrorResponse>, { productId: number }>({
    mutationFn: async ({ productId }) => {
      const res = await api.req({
        method: 'DELETE',
        url: `/cart/${productId}`,
      })

      return res.data
    },
    onMutate: async ({ productId }) => {
      await queryClient.cancelQueries({ queryKey: ['get-all-carts'] })
      const previous = queryClient.getQueryData(['get-all-carts'])
      queryClient.setQueryData(['get-all-carts'], (old: Cart.API.GetAllResponse | undefined) => {
        if (!old) return old
        return {
          ...old,
          groups: old.groups
            .map((group) => ({
              ...group,
              items: group.items.filter((item) => item.product.id !== productId),
            }))
            .filter((group) => group.items.length > 0),
        }
      })
      return { previous }
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(['get-all-carts'], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-carts'] })
    },
  })

  return mutation
}

export const cartApi = {
  useGetAll,
  useAdd,
  useClear,
  useRemoveItem,
  useUpdateQuantity,
}
