import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'
import { PickupPointsMapModal } from './PickupPointsMapModal'
import { AddressPicker } from './AddressPicker'
import { RadioCircle } from '#/shared/ui/RadioCircle'
import { useGetPickupPointsPickupPointsGet } from '#/shared/openapi/queries'
import { useCityStore } from '#/shared/stores/cityStore'

type DeliveryOption = 'pickup' | 'delivery'

interface DeliveryMethodProps {
  value: DeliveryOption
  onChange: (value: DeliveryOption) => void
  address: string
  onAddressChange: (address: string) => void
  pickupPointId: number | null
  onPickupPointChange: (id: number) => void
  /** Выбор адреса: из сохранённых или вручную (см. AddressPicker). */
  addressId: number
  onAddressIdChange: (id: number) => void
  saveAddress: boolean
  onSaveAddressChange: (save: boolean) => void
  saveAddressTitle: string
  onSaveAddressTitleChange: (title: string) => void
}

const options: Array<{ key: string; value: DeliveryOption }> = [
  { key: 'checkout.pickup', value: 'pickup' },
  { key: 'checkout.delivery', value: 'delivery' },
]

export const DeliveryMethod = ({
  value,
  onChange,
  address,
  onAddressChange,
  pickupPointId,
  onPickupPointChange,
  addressId,
  onAddressIdChange,
  saveAddress,
  onSaveAddressChange,
  saveAddressTitle,
  onSaveAddressTitleChange,
}: DeliveryMethodProps) => {
  const { t } = useTranslation()
  const cityId = useCityStore((s) => s.cityId)
  const { data: pickupPoints, isLoading: isLoadingPoints } = useGetPickupPointsPickupPointsGet(
    {},
    undefined,
    { enabled: value === 'pickup' },
  )

  const cityPickupPoints = useMemo(
    () => pickupPoints?.filter((point) => point.city_id === cityId) ?? [],
    [pickupPoints, cityId],
  )

  useEffect(() => {
    if (cityPickupPoints[0] && pickupPointId === null) {
      onPickupPointChange(cityPickupPoints[0].id)
    }
  }, [cityPickupPoints])

  return (
    <div className="bg-white p-4 rounded-base">
      <h2 className="p2 font-semibold mb-4">{t('checkout.deliveryMethod')}</h2>
      <div className="w-full">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className="w-full flex items-center justify-between py-4 bg-white cursor-pointer border-b border-stroke last:border-b-0"
          >
            <span className="p3 font-medium">{t(option.key)}</span>
            <RadioCircle selected={value === option.value} />
          </button>
        ))}
      </div>

      {value === 'pickup' && (
        <div className="mt-3 flex flex-col gap-2">
          {isLoadingPoints ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : cityPickupPoints.length === 0 ? (
            <p className="t2 font-medium text-passive2">{t('checkout.noPickupPoints')}</p>
          ) : (
            <div className="flex flex-col">
              <div className="flex justify-end pb-2">
                <PickupPointsMapModal
                  points={cityPickupPoints}
                  selectedId={pickupPointId}
                  onSelect={onPickupPointChange}
                />
              </div>
              {cityPickupPoints.map((point) => (
                <button
                  key={point.id}
                  onClick={() => onPickupPointChange(point.id)}
                  className="flex items-center gap-3 py-3 border-b border-stroke last:border-b-0 text-left cursor-pointer"
                >
                  <div className="size-9 rounded-xl bg-gray2 flex items-center justify-center shrink-0">
                    <MapPin width={18} height={18} className="text-passive2" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="p3 font-medium truncate">{point.name}</p>
                    <p className="t2 text-passive2 truncate">{point.address}</p>
                  </div>
                  <RadioCircle selected={pickupPointId === point.id} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {value === 'delivery' && (
        <AddressPicker
          address={address}
          onAddressChange={onAddressChange}
          selectedId={addressId}
          onSelectedIdChange={onAddressIdChange}
          save={saveAddress}
          onSaveChange={onSaveAddressChange}
          saveTitle={saveAddressTitle}
          onSaveTitleChange={onSaveAddressTitleChange}
        />
      )}
    </div>
  )
}
