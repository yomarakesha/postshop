import { useMutation, useQueryClient } from '@tanstack/react-query'

import { setContactUsHandledContactUsContactIdHandledPatch } from '@/shared/openapi/requests'

/**
 * Отметка «обращение обработано».
 *
 * Ответить человеку через платформу нельзя — в обращении есть только имя,
 * телефон и текст, канала для ответа нет. Отметка нужна ровно для того, чтобы
 * отличать разобранные обращения от новых: без неё список рос, и повторно
 * звонили одному и тому же.
 */
export function useSetHandledMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ contactId, handled }: { contactId: number; handled: boolean }) =>
      setContactUsHandledContactUsContactIdHandledPatch({
        path: { contact_id: contactId },
        body: { is_handled: handled },
        throwOnError: true,
      }),
    onSuccess: () => {
      // Ключ ровно тот, под которым лежит список (см. useContactUsRequestsQuery):
      // с другим отметка проходила, а таблица оставалась прежней.
      queryClient.invalidateQueries({ queryKey: ['contact-us-requests'] })
    },
  })
}
