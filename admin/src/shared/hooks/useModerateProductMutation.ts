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
 * Что передаётся в mutate: id товара или id с причиной отказа.
 *
 * Причины не было вовсе: диалог отклонения обещал «Продавец увидит указанную
 * причину», а поля для неё не было, и сервер получал пустой отказ. Голый id
 * оставлен, чтобы одобрение и старые вызовы не менялись.
 */
export type ModerateProductVars = number | { productId: number; comment?: string | null }

/** id товара из переменных мутации — для занятости строк в очереди. */
export const moderatedProductId = (vars: ModerateProductVars) =>
  typeof vars === 'number' ? vars : vars.productId

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
    mutationFn: (vars: ModerateProductVars) => {
      const productId = moderatedProductId(vars)
      const comment = typeof vars === 'number' ? null : vars.comment?.trim() || null
      return runModerationDecision(
        () =>
          decision === 'approved'
            ? approveProductProductsProductIdApprovePatch({
                path: { product_id: productId },
                throwOnError: true,
              })
            : declineProductProductsProductIdDeclinePatch({
                path: { product_id: productId },
                body: { moderation_comment: comment },
                throwOnError: true,
              }),
        decision,
      )
    },
    onSuccess: (outcome, vars) => {
      removeFromModerationQueue(queryClient, moderatedProductId(vars))
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
