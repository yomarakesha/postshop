import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { getErrorMessage } from '@/shared/lib/apiError'
import { deleteCollectionCollectionsCollectionIdDelete } from '@/shared/openapi/requests'

/**
 * Удаление подборки.
 *
 * Удаляется только сама подборка и её состав: товары остаются на месте — связь
 * collection_products каскадная, а товары ей не подчинены. Поэтому удаление
 * здесь безопасно, в отличие от почти всего остального в базе.
 */
export function useDeleteCollectionMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (collectionId: number) =>
      deleteCollectionCollectionsCollectionIdDelete({
        path: { collection_id: collectionId },
        throwOnError: true,
      }),
    onSuccess: () => {
      toast.success(t('collections.deleted'))
      void queryClient.invalidateQueries({ queryKey: ['collections'] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}
