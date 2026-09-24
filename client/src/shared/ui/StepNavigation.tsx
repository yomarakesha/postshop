import { useTranslation } from 'react-i18next'
import { Button } from './Button'
import ArrowIcon from '#/shared/assets/icons/arrow.svg?react'

interface Props {
  onBack: () => void
  onNext: () => void
  nextLabel?: string
  disabled?: boolean
  /** На первом шаге возвращаться некуда — кнопку «назад» показывать не нужно. */
  showBack?: boolean
}

export const StepNavigation = ({ onBack, onNext, nextLabel, disabled, showBack = true }: Props) => {
  const { t } = useTranslation()

  return (
    <div className="flex gap-2 items-center">
      {showBack && (
        <Button
          onClick={onBack}
          className="w-12 flex items-center justify-center rounded-xl bg-blue2 px-0"
        >
          <ArrowIcon className="text-blue-main" />
        </Button>
      )}
      <Button className="flex-1" onClick={onNext} disabled={disabled}>
        {nextLabel ?? t('services.next')}
      </Button>
    </div>
  )
}
