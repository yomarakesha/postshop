import { forwardRef, useImperativeHandle, useRef } from 'react'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import type { ModalRef } from '#/shared/ui/Modal'
import { Modal } from '#/shared/ui/Modal'
import { Input } from '#/shared/ui/Input'
import { Button } from '#/shared/ui/Button'
import { TextArea } from '#/shared/ui/TextArea'
import { useUpdateShopAdditionalShopAdditionalsShopAdditionalIdPut } from '#/shared/openapi/queries'
import { settled } from '#/shared/lib/settled'

interface NameModalProps {
  shopAdditionalId: number
  initialName?: string
  initialDescription?: string
  onSave: (name: string, description: string) => void
}

export const NameModal = forwardRef<ModalRef, NameModalProps>(
  ({ shopAdditionalId, initialName = '', initialDescription = '', onSave }, ref) => {
    const { t } = useTranslation()
    const modalRef = useRef<ModalRef>(null)
    const updateShopAdditional = useUpdateShopAdditionalShopAdditionalsShopAdditionalIdPut()

    const nameSchema = z.string().min(1, t('storeActivate.nameModal.nameError'))
    const descriptionSchema = z.string().min(1, t('storeActivate.nameModal.descriptionError'))

    useImperativeHandle(ref, () => ({
      open: () => modalRef.current?.open(),
      close: () => modalRef.current?.close(),
    }))

    const form = useForm({
      defaultValues: { name: initialName, description: initialDescription },
      onSubmit: async ({ value }) => {
        const result = await settled(
          updateShopAdditional.mutateAsync({
            path: { shop_additional_id: shopAdditionalId },
            body: {
              name: value.name,
              description: value.description,
            },
          }),
        )

        if (result?.data) {
          onSave(value.name, value.description)
          modalRef.current?.close()
        }
      },
    })

    return (
      <Modal ref={modalRef} className="w-full max-w-125 p-6 bg-gray2">
        <h2 className="p1 text-center font-bold text-lg mb-6">
          {t('storeActivate.nameModal.title')}
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="flex flex-col gap-4"
        >
          <form.Field
            name="name"
            validators={{
              onBlur: ({ value }) => nameSchema.safeParse(value).error?.issues[0]?.message,
            }}
          >
            {(field) => (
              <div>
                <Input
                  label={t('storeActivate.nameModal.nameLabel')}
                  required
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <p className="t2 text-(--failure) mt-1">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>
          <form.Field
            name="description"
            validators={{
              onBlur: ({ value }) => descriptionSchema.safeParse(value).error?.issues[0]?.message,
            }}
          >
            {(field) => (
              <div>
                <TextArea
                  label={t('storeActivate.nameModal.descriptionLabel')}
                  required
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  rows={4}
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <p className="t2 text-(--failure) mt-1">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>
          <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting
                  ? t('storeActivate.nameModal.saving')
                  : t('storeActivate.nameModal.save')}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </Modal>
    )
  },
)

NameModal.displayName = 'NameModal'
