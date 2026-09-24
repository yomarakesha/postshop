import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'
import { useListAddressesUserAddressesGet } from '#/shared/openapi/queries'
import { useProfileStore } from '#/shared/stores/profileStore'
import { RadioCircle } from '#/shared/ui/RadioCircle'
import { Checkbox } from '#/shared/ui/Checkbox'
import { Input } from '#/shared/ui/Input'
import BuildingIcon from '#/shared/assets/icons/building.svg?react'

/** Значение выбора «другой адрес»: у сохранённых адресов номера положительные. */
const OTHER = -1

interface Props {
  /** Текст адреса, который уйдёт в заказ. */
  address: string
  onAddressChange: (address: string) => void
  /** Какой сохранённый адрес выбран; OTHER — введён вручную. */
  selectedId: number
  onSelectedIdChange: (id: number) => void
  save: boolean
  onSaveChange: (save: boolean) => void
  saveTitle: string
  onSaveTitleChange: (title: string) => void
}

/**
 * Выбор адреса доставки: из сохранённых или вручную.
 *
 * Раньше здесь было одно поле ввода, и адрес набирался заново при каждом
 * заказе — сохранить его было нельзя. Основной адрес подставляется сразу:
 * человеку, который заказывает домой, не нужно вообще ничего нажимать.
 *
 * Заказ хранит текст адреса на момент покупки, а не ссылку на запись: если
 * потом поправить свой адрес, прошлые заказы меняться не должны.
 */
export const AddressPicker = ({
  address,
  onAddressChange,
  selectedId,
  onSelectedIdChange,
  save,
  onSaveChange,
  saveTitle,
  onSaveTitleChange,
}: Props) => {
  const { t } = useTranslation()
  const profile = useProfileStore((s) => s.profile)

  const { data: addresses } = useListAddressesUserAddressesGet({}, undefined, {
    enabled: Boolean(profile),
  })
  const saved = addresses ?? []

  // Основной адрес подставляется один раз, при первой загрузке списка: дальше
  // выбор принадлежит человеку, и перетирать его нельзя.
  useEffect(() => {
    if (selectedId !== OTHER || address || saved.length === 0) return
    const preferred = saved.find((row) => row.is_default) ?? saved[0]
    onSelectedIdChange(preferred.id)
    onAddressChange(preferred.address)
  }, [saved.length])

  const pick = (id: number, text: string) => {
    onSelectedIdChange(id)
    onAddressChange(text)
    onSaveChange(false)
  }

  return (
    <div className="mt-1 flex flex-col">
      {saved.map((row) => (
        <button
          key={row.id}
          type="button"
          onClick={() => pick(row.id, row.address)}
          className="flex cursor-pointer items-center gap-3 border-b border-stroke py-3 text-left last:border-b-0"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gray2">
            <MapPin width={18} height={18} className="text-passive2" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="p3 truncate font-medium">{row.title}</p>
            <p className="t2 truncate text-passive2">{row.address}</p>
          </div>
          <RadioCircle selected={selectedId === row.id} />
        </button>
      ))}

      {saved.length > 0 && (
        <button
          type="button"
          onClick={() => pick(OTHER, '')}
          className="flex cursor-pointer items-center gap-3 py-3 text-left"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gray2">
            <BuildingIcon width={20} height={20} />
          </div>
          <p className="p3 flex-1 font-medium">{t('addresses.newAddress')}</p>
          <RadioCircle selected={selectedId === OTHER} />
        </button>
      )}

      {selectedId === OTHER && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            {saved.length === 0 && (
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gray2">
                <BuildingIcon width={20} height={20} />
              </div>
            )}
            <div className="flex-1">
              <Input
                placeholder={t('checkout.addressPlaceholder')}
                value={address}
                onChange={(e) => onAddressChange(e.target.value)}
              />
            </div>
          </div>

          {/* Предложение сохранить показываем только вошедшим: гостю адрес
              сохранять некуда, а флажок, который ничего не делает, хуже его
              отсутствия. */}
          {profile && (
            <>
              <button
                type="button"
                onClick={() => onSaveChange(!save)}
                className="flex cursor-pointer items-center gap-2 self-start"
              >
                <Checkbox checked={save} />
                <span className="t1">{t('addresses.saveThis')}</span>
              </button>
              {save && (
                <Input
                  placeholder={t('addresses.saveThisName')}
                  value={saveTitle}
                  onChange={(e) => onSaveTitleChange(e.target.value)}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
