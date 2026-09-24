import { useMutation, useQueryClient } from '@tanstack/react-query'

import { rejectReturnReturnsRequestIdRejectPatch } from '@/shared/openapi/requests'

/** Отказ. Причина обязательна и на сервере: покупатель иначе не поймёт решения. */
export function useReturnRejectMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, comment }: { requestId: number; comment: string }) =>
      rejectReturnReturnsRequestIdRejectPatch({
        path: { request_id: requestId },
        body: { resolution_comment: comment },
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns'] })
    },
  })
}
