import { useMutation, useQueryClient } from '@tanstack/react-query'

import { approveReviewReviewsReviewIdApprovePatch } from '@/shared/openapi/requests'

export function useReviewApproveMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reviewId: number) =>
      approveReviewReviewsReviewIdApprovePatch({
        path: { review_id: reviewId },
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'moderation'] })
      queryClient.invalidateQueries({ queryKey: ['reviews', 'moderation-count'] })
    },
  })
}
