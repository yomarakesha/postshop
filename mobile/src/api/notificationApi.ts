import { AxiosError } from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '.'

const LIST_KEY = 'notifications'
const COUNT_KEY = 'notifications-unread-count'

const useGetAll = (params: Notification.API.ListVars, enabled = true) =>
  useQuery<Notification.Item[], AxiosError<ApiErrorResponse>>({
    queryKey: [LIST_KEY, params],
    queryFn: async () => {
      const res = await api.req({
        method: 'GET',
        url: '/notifications/',
        params,
      })
      return res.data
    },
    enabled,
  })

/**
 * Счётчик для значка у пункта «Уведомления».
 *
 * Отдельная лёгкая ручка: тянуть ради числа весь список — лишний трафик на
 * каждом открытии профиля.
 */
const useUnreadCount = (enabled = true) =>
  useQuery<Notification.UnreadCount, AxiosError<ApiErrorResponse>>({
    queryKey: [COUNT_KEY],
    queryFn: async () => {
      const res = await api.req({
        method: 'GET',
        url: '/notifications/unread-count',
      })
      return res.data
    },
    enabled,
  })

/** После любого изменения список и счётчик расходятся — обновляем оба. */
const useInvalidate = () => {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: [LIST_KEY] })
    queryClient.invalidateQueries({ queryKey: [COUNT_KEY] })
  }
}

const useMarkRead = () => {
  const invalidate = useInvalidate()
  return useMutation<unknown, AxiosError<ApiErrorResponse>, number>({
    mutationFn: async (notificationId) =>
      api.req({
        method: 'PATCH',
        url: `/notifications/${notificationId}/read`,
      }),
    onSuccess: invalidate,
  })
}

const useMarkAllRead = () => {
  const invalidate = useInvalidate()
  return useMutation<unknown, AxiosError<ApiErrorResponse>, void>({
    mutationFn: async () => api.req({ method: 'PATCH', url: '/notifications/read-all' }),
    onSuccess: invalidate,
  })
}

const useDelete = () => {
  const invalidate = useInvalidate()
  return useMutation<unknown, AxiosError<ApiErrorResponse>, number>({
    mutationFn: async (notificationId) =>
      api.req({
        method: 'DELETE',
        url: `/notifications/${notificationId}`,
      }),
    onSuccess: invalidate,
  })
}

export const notificationApi = {
  useGetAll,
  useUnreadCount,
  useMarkRead,
  useMarkAllRead,
  useDelete,
}
