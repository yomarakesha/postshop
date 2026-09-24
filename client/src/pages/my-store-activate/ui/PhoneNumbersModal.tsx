import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ModalRef } from '#/shared/ui/Modal'
import { Modal } from '#/shared/ui/Modal'
import { Button } from '#/shared/ui/Button'
import { useUpdateShopAdditionalShopAdditionalsShopAdditionalIdPut } from '#/shared/openapi/queries'
import { PhoneNumberInput } from '#/shared/ui/PhoneNumberInput'
import { settled } from '#/shared/lib/settled'

interface PhoneNumbersModalProps {
  shopAdditionalId: number
  initialPhoneNumbers: Array<string>
  onSave: () => void
}

export const PhoneNumbersModal = forwardRef<ModalRef, PhoneNumbersModalProps>(
  ({ shopAdditionalId, initialPhoneNumbers, onSave }, ref) => {
    const { t } = useTranslation()
    const modalRef = useRef<ModalRef>(null)
    const [phoneNumbers, setPhoneNumbers] = useState<Array<string>>(
      initialPhoneNumbers.length > 0 ? initialPhoneNumbers : [''],
    )
    const [error, setError] = useState<string | null>(null)

    const updateShopAdditional = useUpdateShopAdditionalShopAdditionalsShopAdditionalIdPut()

    useImperativeHandle(ref, () => ({
      open: () => {
        setPhoneNumbers(initialPhoneNumbers.length > 0 ? initialPhoneNumbers : [''])
        setError(null)
        modalRef.current?.open()
      },
      close: () => modalRef.current?.close(),
    }))

    const handleChange = (index: number, value: string) => {
      setPhoneNumbers((prev) => prev.map((p, i) => (i === index ? value : p)))
      setError(null)
    }

    const handleAdd = () => {
      setPhoneNumbers((prev) => [...prev, ''])
    }

    const handleRemove = (index: number) => {
      setPhoneNumbers((prev) => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      const filtered = phoneNumbers.map((p) => p.trim()).filter(Boolean)
      if (filtered.length === 0) {
        setError(t('storeActivate.phoneNumbersModal.error'))
        return
      }

      const result = await settled(
        updateShopAdditional.mutateAsync({
          path: { shop_additional_id: shopAdditionalId },
          body: { phone_numbers: filtered },
        }),
      )

      if (result?.data) {
        onSave()
        modalRef.current?.close()
      }
    }

    return (
      <Modal ref={modalRef} className="w-full max-w-125 p-6 bg-gray2">
        <h2 className="p1 text-center font-bold text-lg mb-6">
          {t('storeActivate.phoneNumbersModal.title')}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {phoneNumbers.map((phone, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="flex-1">
                <PhoneNumberInput
                  label={`${t('storeActivate.phoneNumbersModal.label')} ${index + 1}`}
                  value={phone}
                  onChange={(e) => handleChange(index, e.target.value)}
                />
              </div>
              {phoneNumbers.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="flex items-center justify-center size-11 text-passive2 hover:text-failure transition-colors shrink-0"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}

          {error && <p className="t2 text-(--failure)">{error}</p>}

          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-2 p3 font-medium text-blue-main hover:opacity-80 transition-opacity"
          >
            <Plus size={18} />
            {t('storeActivate.phoneNumbersModal.add')}
          </button>

          <Button type="submit" disabled={updateShopAdditional.isPending}>
            {updateShopAdditional.isPending
              ? t('storeActivate.phoneNumbersModal.saving')
              : t('storeActivate.phoneNumbersModal.save')}
          </Button>
        </form>
      </Modal>
    )
  },
)

PhoneNumbersModal.displayName = 'PhoneNumbersModal'
