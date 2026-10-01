import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  productModerationKeys,
  refreshModeration,
  removeFromModerationQueue,
  runModerationDecision,
} from '@/shared/lib/productModeration'
import type { ModerationDecision } from '@/shared/lib/productModeration'
import {
  approveProductProductsProductIdApprovePatch,
  declineProductProductsProductIdDeclinePatch,
} from '@/shared/openapi/requests'

/**
 * Одобрение или отклонение товара — общее для очереди и карточки.
 *
 * Список и карточка держали по своей копии этих хуков, и обе ошибались
 * одинаково: invalidateQueries в onSuccess не возвращался, поэтому кнопки
 * оживали до перезапроса, а onError/onSettled не было вовсе — после отказа
 * сервера экран не обновлялся.
 */
export function useModerateProductMutation(
  decision: ModerationDecision,
  options: { onDone?: () => void } = {},
) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationKey: productModerationKeys.decide(decision),
    mutationFn: (productId: number) =>
      runModerationDecision(
        () =>
          decision === 'approved'
            ? approveProductProductsProductIdApprovePatch({
                path: { product_id: productId },
                throwOnError: true,
              })
            : declineProductProductsProductIdDeclinePatch({
                path: { product_id: productId },
                throwOnError: true,
              }),
        decision,
      ),
    onSuccess: (outcome, productId) => {
      removeFromModerationQueue(queryClient, productId)
      if (outcome === 'already') {
        toast.info(
          t(decision === 'approved' ? 'moderation.alreadyApproved' : 'moderation.alreadyDeclined'),
        )
      }
      options.onDone?.()
    },
    onSettled: () => refreshModeration(queryClient),
  })
}
