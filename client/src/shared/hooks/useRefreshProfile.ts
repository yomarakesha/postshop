import { useQueryClient } from '@tanstack/react-query'
import { useMeAuthMeGetKey } from '#/shared/openapi/queries/common'

/**
 * Перечитать профиль пользователя.
 *
 * Названия и логотипы магазинов приходят в профиле (`/auth/me`) и оттуда
 * попадают в шапку и в выбор магазина. Правка магазина обновляла только его
 * собственную карточку, поэтому переименованный магазин оставался под старым
 * именем везде, кроме той страницы, где его переименовали, — до полной
 * перезагрузки.
 */
export const useRefreshProfile = () => {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: [useMeAuthMeGetKey] })
  }
}
