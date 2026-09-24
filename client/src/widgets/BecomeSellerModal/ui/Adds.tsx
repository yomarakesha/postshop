import { useTranslation } from 'react-i18next'
import { Button } from '#/shared/ui/Button'
import ArrowIcon from '#/shared/assets/icons/arrow.svg?react'

interface Props {
  onClose: () => void
  onNext: () => void
}

export const Adds = ({ onClose, onNext }: Props) => {
  const { t } = useTranslation()

  return (
    <div className="text-white bg-[linear-gradient(180deg,#2859B6_0%,#18356D_100%)] p-6 flex flex-col items-center gap-6">
      <div className="flex gap-2 items-center w-full">
        <button onClick={onClose} className="p-2">
          <ArrowIcon />
        </button>
        <p className="p1 font-semibold">{t('services.adds.title')}</p>
      </div>

      <img
        src="/illustrations/become-store-add.png"
        className="w-full max-w-87 mb-6"
        loading="lazy"
      />

      <div className="flex flex-col gap-4">
        <h3 className="font-bold">{t('services.adds.heading')}</h3>
        <p className="p2 font-bold">{t('services.adds.freeMonth')}</p>
        <p className="p3">{t('services.adds.description')}</p>
      </div>

      <Button className="w-full" onClick={onNext}>
        {t('services.adds.cta')}
      </Button>
    </div>
  )
}
