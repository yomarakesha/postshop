import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ModalRef } from '#/shared/ui/Modal'
import { Modal } from '#/shared/ui/Modal'
import { Button } from '#/shared/ui/Button'
import { cn } from '#/shared/utils/cn'
import {
  useCreateShopAdditionalShopAdditionalsPost,
  useUpdateShopAdditionalShopAdditionalsShopAdditionalIdPut,
} from '#/shared/openapi/queries'
import { WarehouseType } from '#/shared/openapi/requests'
import StoreBlue from '#/shared/assets/icons/store-blue.svg?react'
import StoreGray from '#/shared/assets/icons/store-gray.svg?react'
import { settled } from '#/shared/lib/settled'

interface WarehouseTypeModalProps {
  /** Магазин, которому выбирается тип склада. */
  storeId: number
  /** Профиль магазина, если он уже создан. */
  shopAdditionalId?: number
  initialType?: WarehouseType | null
  onSave: () => void
}

const options = [WarehouseType.FBS, WarehouseType.FBO] as const

/**
 * Выбор типа склада.
 *
 * Шаг был закомментирован в четырёх местах, а `WarehouseType.FBS` прошит в коде:
 * тип склада не выбирал никто, и все магазины, созданные через витрину,
 * оказывались складскими независимо от того, как продавец на самом деле
 * работает. Модалка при этом была цела, но недостижима.
 *
 * Тип обязателен при создании профиля, поэтому модалка умеет и создавать
 * профиль с выбранным типом (это первый шаг активации), и менять тип у
 * существующего.
 */
export const WarehouseTypeModal = forwardRef<ModalRef, WarehouseTypeModalProps>(
  ({ storeId, shopAdditionalId, initialType, onSave }, ref) => {
    const { t } = useTranslation()
    const modalRef = useRef<ModalRef>(null)
    const [selected, setSelected] = useState<WarehouseType | null>(initialType ?? null)

    const createShopAdditional = useCreateShopAdditionalShopAdditionalsPost()
    const updateShopAdditional = useUpdateShopAdditionalShopAdditionalsShopAdditionalIdPut()
    const isPending = createShopAdditional.isPending || updateShopAdditional.isPending

    useImperativeHandle(ref, () => ({
      open: () => {
        setSelected(initialType ?? null)
        modalRef.current?.open()
      },
      close: () => modalRef.current?.close(),
    }))

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!selected) return

      const result =
        shopAdditionalId === undefined
          ? await settled(
              createShopAdditional.mutateAsync({
                body: { shop_base_id: storeId, warehouse_type: selected },
              }),
            )
          : await settled(
              updateShopAdditional.mutateAsync({
                path: { shop_additional_id: shopAdditionalId },
                body: { warehouse_type: selected },
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
          {t('storeActivate.warehouseTypeModal.title')}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {options.map((type) => {
            const isSelected = selected === type
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelected(type)}
                className={cn(
                  'flex flex-col items-center gap-3 rounded-xl border-2 bg-white p-5 transition-colors',
                  isSelected ? 'border-blue-main' : 'border-transparent',
                )}
              >
                {isSelected ? (
                  <StoreBlue width={56} height={56} />
                ) : (
                  <StoreGray width={56} height={56} />
                )}
                <p className="p2 font-semibold">
                  {t(`storeActivate.warehouseTypeModal.${type}.name`)}
                </p>
                <p className="t1 text-passive2 text-center">
                  {t(`storeActivate.warehouseTypeModal.${type}.description`)}
                </p>
              </button>
            )
          })}

          <Button type="submit" disabled={!selected || isPending}>
            {isPending
              ? t('storeActivate.warehouseTypeModal.saving')
              : t('storeActivate.warehouseTypeModal.save')}
          </Button>
        </form>
      </Modal>
    )
  },
)

WarehouseTypeModal.displayName = 'WarehouseTypeModal'
