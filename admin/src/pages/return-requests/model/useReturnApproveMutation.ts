import { useMutation, useQueryClient } from '@tanstack/react-query'

import { approveReturnReturnsRequestIdApprovePatch } from '@/shared/openapi/requests'

/**
 * Подтверждение возврата.
 *
 * Это утверждение платформы, что товар у неё: сервер тем же действием
 * возвращает товар на склад магазинам со складским учётом.
 */
export function useReturnApproveMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, comment }: { requestId: number; comment?: string }) =>
      approveReturnReturnsRequestIdApprovePatch({
        path: { request_id: requestId },
        body: { resolution_comment: comment ?? null },
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns'] })
    },
  })
}
