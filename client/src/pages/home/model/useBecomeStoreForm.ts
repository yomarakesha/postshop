import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import {
  useCreateShopBaseShopBasesPost,
  useUploadShopDocumentsShopBasesShopIdDocumentsPost,
} from '#/shared/openapi/queries'
import { LegalEntityType } from '#/shared/openapi/requests'
import { getErrorMessage } from '#/shared/lib/apiError'
import { DOCUMENT_SLOTS } from '#/widgets/BecomeSellerModal/model/documentSlots'

export interface BecomeStoreFormValues {
  legalEntityType: LegalEntityType
  files: Partial<Record<number, File>>
}

const defaultValues: BecomeStoreFormValues = {
  legalEntityType: LegalEntityType.INDIVIDUAL_ENTREPRENEUR,
  files: {},
}

export function useBecomeStoreForm({ onSuccess }: { onSuccess: () => void }) {
  const createShopBase = useCreateShopBaseShopBasesPost()
  const uploadDocuments = useUploadShopDocumentsShopBasesShopIdDocumentsPost()

  const isSubmitting = createShopBase.isPending || uploadDocuments.isPending
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      setError(null)

      // Ошибку сервера раньше искали в result.error и подставляли туркменскую
      // строку по умолчанию, зашитую в код. Теперь клиент бросает, текст даёт
      // общий разбор ошибки, а сообщение остаётся и на форме — рядом с полями,
      // а не только тостом.
      let failure: unknown = null
      const createResult = await createShopBase
        .mutateAsync({
          body: {
            legal_entity_type: value.legalEntityType,
            documents: [],
          },
        })
        .catch((err: unknown) => {
          failure = err
          return undefined
        })

      if (!createResult?.data) {
        setError(getErrorMessage(failure))
        return
      }

      // Файлы лежат по номеру поля; вид каждого берётся из того же поля —
      // порядок файлов и видов на сервере должен совпадать.
      const slots = DOCUMENT_SLOTS[value.legalEntityType]
      const chosen = slots.flatMap((slot, index) => {
        const file = value.files[index]
        return file ? [{ file, kind: slot.kind }] : []
      })
      const fileList = chosen.map((item) => item.file)
      if (fileList.length > 0) {
        const uploadResult = await uploadDocuments
          .mutateAsync({
            path: { shop_id: createResult.data.id },
            body: {
              files: fileList as unknown as Array<string>,
              kinds: chosen.map((item) => item.kind),
            },
          })
          .catch((err: unknown) => {
            failure = err
            return undefined
          })

        if (!uploadResult?.data) {
          setError(getErrorMessage(failure))
          return
        }
      }

      onSuccess()
    },
  })

  const reset = () => {
    form.reset()
    setError(null)
    createShopBase.reset()
    uploadDocuments.reset()
  }

  return { form, isSubmitting, error, reset }
}

export type BecomeStoreForm = ReturnType<typeof useBecomeStoreForm>['form']
