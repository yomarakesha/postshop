import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import {
  RegistrationStatus,
  updateShopBaseRegistrationStatusShopBasesShopIdRegistrationStatusPatch,
} from '@/shared/openapi/requests'

export function useUpdateRegistrationStatusMutation(shopId: number) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    // Причина обязательна при отклонении и приостановке: без неё владелец не
    // знает, что исправить, и сервер такой запрос отвергает.
    mutationFn: ({ status, comment }: { status: RegistrationStatus; comment?: string }) =>
      updateShopBaseRegistrationStatusShopBasesShopIdRegistrationStatusPatch({
        path: { shop_id: shopId },
        body: { registration_status: status, registration_comment: comment || null },
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-bases'] })
      navigate('/become-store-requests')
    },
  })
}
