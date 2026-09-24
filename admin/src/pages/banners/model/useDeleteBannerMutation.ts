import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { getErrorMessage } from '@/shared/lib/apiError'
import { deleteBannerBannersBannerIdDelete } from '@/shared/openapi/requests'

/**
 * Удаление баннера.
 *
 * Метод в API существовал с самого начала и умеет главное — убирает вместе с
 * записью её файлы с диска, — но вызывать его было неоткуда: в админке не было
 * ни одной кнопки удаления вообще. Баннеры оставалось только выключать, и
 * список копил мёртвую сезонную рекламу без всякой возможности её убрать.
 */
export function useDeleteBannerMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (bannerId: number) =>
      deleteBannerBannersBannerIdDelete({
        path: { banner_id: bannerId },
        throwOnError: true,
      }),
    onSuccess: () => {
      toast.success(t('banners.deleted'))
      void queryClient.invalidateQueries({ queryKey: ['banners'] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}
