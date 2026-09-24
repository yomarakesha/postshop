import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ModalRef } from '#/shared/ui/Modal'
import { Modal } from '#/shared/ui/Modal'
import { Input } from '#/shared/ui/Input'
import { Button } from '#/shared/ui/Button'
import { useUpdateShopAdditionalShopAdditionalsShopAdditionalIdPut } from '#/shared/openapi/queries'
import { settled } from '#/shared/lib/settled'

interface AddressesModalProps {
  shopAdditionalId: number
  initialAddresses: Array<string>
  onSave: () => void
}

export const AddressesModal = forwardRef<ModalRef, AddressesModalProps>(
  ({ shopAdditionalId, initialAddresses, onSave }, ref) => {
    const { t } = useTranslation()
    const modalRef = useRef<ModalRef>(null)
    const [addresses, setAddresses] = useState<Array<string>>(
      initialAddresses.length > 0 ? initialAddresses : [''],
    )
    const [error, setError] = useState<string | null>(null)

    const updateShopAdditional = useUpdateShopAdditionalShopAdditionalsShopAdditionalIdPut()

    useImperativeHandle(ref, () => ({
      open: () => {
        setAddresses(initialAddresses.length > 0 ? initialAddresses : [''])
        setError(null)
        modalRef.current?.open()
      },
      close: () => modalRef.current?.close(),
    }))

    const handleChange = (index: number, value: string) => {
      setAddresses((prev) => prev.map((a, i) => (i === index ? value : a)))
      setError(null)
    }

    const handleAdd = () => {
      setAddresses((prev) => [...prev, ''])
    }

    const handleRemove = (index: number) => {
      setAddresses((prev) => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      const filtered = addresses.map((a) => a.trim()).filter(Boolean)
      if (filtered.length === 0) {
        setError(t('storeActivate.addressesModal.error'))
        return
      }

      const result = await settled(
        updateShopAdditional.mutateAsync({
          path: { shop_additional_id: shopAdditionalId },
          body: { addresses: filtered },
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
          {t('storeActivate.addressesModal.title')}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {addresses.map((address, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  label={`${t('storeActivate.addressesModal.label')} ${index + 1}`}
                  value={address}
                  onChange={(e) => handleChange(index, e.target.value)}
                  placeholder={t('storeActivate.addressesModal.placeholder')}
                />
              </div>
              {addresses.length > 1 && (
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
            {t('storeActivate.addressesModal.add')}
          </button>

          <Button type="submit" disabled={updateShopAdditional.isPending}>
            {updateShopAdditional.isPending
              ? t('storeActivate.addressesModal.saving')
              : t('storeActivate.addressesModal.save')}
          </Button>
        </form>
      </Modal>
    )
  },
)

AddressesModal.displayName = 'AddressesModal'
