import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { createDeliveryMessageDeliveryMessagePost } from '@/shared/openapi/requests'
import type { DeliveryMessageCreate } from '@/shared/openapi/requests'

export function useCreateDeliveryMessageMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (body: DeliveryMessageCreate) =>
      createDeliveryMessageDeliveryMessagePost({ body, throwOnError: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-message'] })
      toast.success(t('deliveryMessage.saved'))
    },
  })
}
