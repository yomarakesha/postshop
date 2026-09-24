import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ModalRef } from '#/shared/ui/Modal'
import { REFERENCE_LIST_LIMIT } from '#/shared/constants/pagination'
import { Modal } from '#/shared/ui/Modal'
import { Button } from '#/shared/ui/Button'
import { cn } from '#/shared/utils/cn'
import {
  useGetCitiesCitiesGet,
  useUpdateShopAdditionalShopAdditionalsShopAdditionalIdPut,
} from '#/shared/openapi/queries'
import { Spinner } from '#/shared/ui/Spinner'
import { settled } from '#/shared/lib/settled'

interface CityModalProps {
  shopAdditionalId: number
  initialCityId?: number | null
  onSave: () => void
}

export const CityModal = forwardRef<ModalRef, CityModalProps>(
  ({ shopAdditionalId, initialCityId, onSave }, ref) => {
    const { t, i18n } = useTranslation()
    const modalRef = useRef<ModalRef>(null)
    const [selected, setSelected] = useState<number | null>(initialCityId ?? null)

    const { data: cities, isLoading } = useGetCitiesCitiesGet({
      query: { limit: REFERENCE_LIST_LIMIT },
    })
    const updateShopAdditional = useUpdateShopAdditionalShopAdditionalsShopAdditionalIdPut()

    useImperativeHandle(ref, () => ({
      open: () => {
        setSelected(initialCityId ?? null)
        modalRef.current?.open()
      },
      close: () => modalRef.current?.close(),
    }))

    const getCityName = (translations: Array<{ language: string; name: string }>) => {
      // eslint-disable-next-line
      const current = translations.find((t) => t.language === i18n.language)
      // eslint-disable-next-line
      return current?.name ?? translations[0]?.name ?? ''
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!selected) return

      const result = await settled(
        updateShopAdditional.mutateAsync({
          path: { shop_additional_id: shopAdditionalId },
          body: { city_id: selected },
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
          {t('storeActivate.cityModal.title')}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto no-scrollbar">
              {cities?.map((city) => {
                const isSelected = selected === city.id
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => setSelected(city.id)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border-2 bg-white px-4 py-3 transition-colors text-left',
                      isSelected ? 'border-blue-main' : 'border-transparent',
                    )}
                  >
                    <p className="p2 font-semibold">{getCityName(city.translations)}</p>
                  </button>
                )
              })}
            </div>
          )}

          <Button type="submit" disabled={!selected || updateShopAdditional.isPending}>
            {updateShopAdditional.isPending
              ? t('storeActivate.cityModal.saving')
              : t('storeActivate.cityModal.save')}
          </Button>
        </form>
      </Modal>
    )
  },
)

CityModal.displayName = 'CityModal'
