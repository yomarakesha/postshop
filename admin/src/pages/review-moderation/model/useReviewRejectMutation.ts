import { useMutation, useQueryClient } from '@tanstack/react-query'

import { rejectReviewReviewsReviewIdRejectPatch } from '@/shared/openapi/requests'

/**
 * Отклонение отзыва.
 *
 * Причина обязательна и на сервере: без неё отзыв просто исчезает, и автор не
 * знает, что исправить.
 */
export function useReviewRejectMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reviewId, comment }: { reviewId: number; comment: string }) =>
      rejectReviewReviewsReviewIdRejectPatch({
        path: { review_id: reviewId },
        body: { moderation_comment: comment },
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'moderation'] })
      queryClient.invalidateQueries({ queryKey: ['reviews', 'moderation-count'] })
    },
  })
}
