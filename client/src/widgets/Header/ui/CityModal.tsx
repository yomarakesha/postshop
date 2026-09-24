import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronRight } from 'lucide-react'
import type { ModalRef } from '#/shared/ui/Modal'
import { REFERENCE_LIST_LIMIT } from '#/shared/constants/pagination'
import CaretIcon from '#/shared/assets/icons/caret.svg?react'
import { Modal } from '#/shared/ui/Modal'
import { RadioCircle } from '#/shared/ui/RadioCircle'
import { useGetCitiesCitiesGet } from '#/shared/openapi/queries'
import { useCityStore } from '#/shared/stores/cityStore'

interface CityModalProps {
  variant?: 'default' | 'light'
}

export const CityModal = ({ variant = 'default' }: CityModalProps) => {
  const modalRef = useRef<ModalRef>(null)
  const { t, i18n } = useTranslation()
  const { data: cities } = useGetCitiesCitiesGet({ query: { limit: REFERENCE_LIST_LIMIT } })
  const cityId = useCityStore((store) => store.cityId)
  const setCityId = useCityStore((store) => store.setCityId)

  const activeCities = cities?.filter((city) => city.is_active) ?? []

  useEffect(() => {
    if (cityId === null && activeCities.length > 0) {
      setCityId(activeCities[0].id)
    }
  }, [cityId, activeCities, setCityId])

  const getCityName = (translations: Array<{ language: string; name: string }>) =>
    translations.find((translation) => translation.language === i18n.language)?.name ??
    translations.at(0)?.name ??
    ''

  const selectedCity = activeCities.find((city) => city.id === cityId)
  const selectedLabel = selectedCity
    ? getCityName(selectedCity.translations)
    : t('header.selectCity')

  return (
    <>
      <button
        onClick={() => modalRef.current?.open()}
        className={
          variant === 'light'
            ? // Оформление повторяет поле поиска рядом: тот же фон, рамка и
              // скругление — город и поиск читаются как одна пара «где и что ищу».
              'flex items-center gap-2 rounded-lg border border-stroke bg-gray2 px-3 py-2.5 ' +
              't1 font-medium text-text hover:border-passive1 transition-colors'
            : 'flex items-center gap-1.5 bg-gray-50 rounded-xl p-2.5 hover:bg-gray-100 transition-colors t2 font-medium'
        }
      >
        {variant === 'light' ? (
          <>
            {/* Иконка геолокации убрана: геопозиция не определяется, и значок
                обещал то, чего нет (S-21 из отчёта). */}
            <span className="max-w-32 truncate">{selectedLabel}</span>
            <ChevronRight size={16} className="shrink-0 text-passive1" />
          </>
        ) : (
          <>
            <span>{selectedLabel}</span>
            <CaretIcon width={10} height={6} />
          </>
        )}
      </button>
      <Modal
        ref={modalRef}
        className="w-full max-w-125 p-6 bg-gray2 max-h-[90vh] overflow-y-scroll no-scrollbar"
      >
        <h2 className="p1 text-center font-bold text-lg mb-6">{t('header.selectCity')}</h2>
        <div className="flex flex-col gap-3 py-2">
          {activeCities.map((city) => (
            <button
              key={city.id}
              onClick={() => {
                setCityId(city.id)
                modalRef.current?.close()
              }}
              className="flex items-center justify-between p-3 bg-white rounded-base cursor-pointer"
            >
              <span className="p2 font-medium">{getCityName(city.translations)}</span>
              <RadioCircle selected={cityId === city.id} />
            </button>
          ))}
        </div>
      </Modal>
    </>
  )
}
