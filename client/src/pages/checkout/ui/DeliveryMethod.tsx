import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'
import { PickupPointsMapModal } from './PickupPointsMapModal'
import { AddressPicker } from './AddressPicker'
import { RadioCircle } from '#/shared/ui/RadioCircle'
import { useGetPickupPointsPickupPointsGet } from '#/shared/openapi/queries'
import { useCityStore } from '#/shared/stores/cityStore'
import { cn } from '#/shared/utils/cn'

type DeliveryOption = 'pickup' | 'delivery'

interface DeliveryMethodProps {
  value: DeliveryOption
  onChange: (value: DeliveryOption) => void
  address: string
  onAddressChange: (address: string) => void
  pickupPointId: number | null
  /** `null` — пункт сброшен: сменился город, или в нём нет ни одного пункта. */
  onPickupPointChange: (id: number | null) => void
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
  /**
   * Пункты выдачи — сразу по городу покупателя и только работающие.
   *
   * Раньше запрос уходил без параметров: сервер отдавал первые 20 пунктов всех
   * городов (включая закрытые), а город отбирался уже здесь. Пункты нужного
   * города могли просто не попасть в эти 20, список оказывался пустым, но
   * «самовывоз» оставался выбранным — и оформление упиралось в «Выберите пункт
   * выдачи» без всякого выхода. Запрос идёт при любом способе: заранее
   * знать, есть ли пункты, нужно, чтобы решить, можно ли их вообще выбрать.
   */
  const { data: pickupPoints, isLoading: isLoadingPoints } = useGetPickupPointsPickupPointsGet(
    { query: { city_id: cityId, is_active: true, limit: 100 } },
    undefined,
    { enabled: cityId !== null },
  )

  const cityPickupPoints = useMemo(
    // Фильтр по городу оставлен как страховка: сервер уже отбирает по city_id.
    () => pickupPoints?.filter((point) => point.city_id === cityId) ?? [],
    [pickupPoints, cityId],
  )

  // Без города пунктов не может быть вовсе; с городом — ждём ответа, чтобы не
  // перещёлкивать способ на время загрузки.
  const noPickupPoints =
    cityId === null ||
    (!isLoadingPoints && pickupPoints !== undefined && cityPickupPoints.length === 0)

  // В городе нет пунктов — «Пункт выдачи» выбрать нельзя, переключаемся на
  // доставку сами, а не оставляем способ, с которым заказ не оформить.
  useEffect(() => {
    if (noPickupPoints && value === 'pickup') onChange('delivery')
  }, [noPickupPoints, value])

  // Выбранный пункт должен быть из текущего списка: после смены города старый
  // пункт другого города уходил бы в заказ незаметно для покупателя.
  useEffect(() => {
    if (pickupPoints === undefined && cityId !== null) return
    const stillListed = cityPickupPoints.some((point) => point.id === pickupPointId)
    if (!stillListed) onPickupPointChange(cityPickupPoints[0]?.id ?? null)
  }, [cityPickupPoints, cityId])

  return (
    <div className="bg-white p-4 rounded-base">
      <h2 className="p2 font-semibold mb-4">{t('checkout.deliveryMethod')}</h2>
      <div className="w-full">
        {options.map((option) => {
          const disabled = option.value === 'pickup' && noPickupPoints
          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className="w-full flex items-center justify-between gap-3 py-4 bg-white cursor-pointer
                         border-b border-stroke last:border-b-0 text-left disabled:cursor-not-allowed"
            >
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className={cn('p3 font-medium', disabled && 'text-passive2')}>
                  {t(option.key)}
                </span>
                {/* Почему пункт выдачи не выбирается — прямо под ним, а не
                    в пустом списке, который при доставке и не виден. */}
                {disabled && (
                  <span className="t2 text-passive2">{t('checkout.noPickupPoints')}</span>
                )}
              </span>
              <RadioCircle selected={value === option.value} />
            </button>
          )
        })}
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
