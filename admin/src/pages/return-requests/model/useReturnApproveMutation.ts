import { useMutation, useQueryClient } from '@tanstack/react-query'

import { approveReturnReturnsRequestIdApprovePatch } from '@/shared/openapi/requests'

/**
 * Подтверждение возврата: покупатель может везти товар назад.
 *
 * Раньше тем же действием товар возвращался в остаток, хотя физически был ещё
 * у покупателя. Теперь остаток меняет только получение
 * (useReturnReceiveMutation), когда товар осмотрен.
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
