import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { updateDeliveryMessageDeliveryMessagePut } from '@/shared/openapi/requests'
import type { DeliveryMessageUpdate } from '@/shared/openapi/requests'

export function useUpdateDeliveryMessageMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (body: DeliveryMessageUpdate) =>
      updateDeliveryMessageDeliveryMessagePut({ body, throwOnError: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-message'] })
      toast.success(t('deliveryMessage.saved'))
    },
  })
}
