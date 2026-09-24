import { ArrowLeft } from 'lucide-react'
import type { PropsWithChildren, SubmitEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/button'

interface Props extends PropsWithChildren {
  onSubmit: (e: SubmitEvent<HTMLFormElement>) => void
  onCancel?: () => void
  submitLabel?: string
  /**
   * Идёт запись. Кнопка блокируется и показывает вращение: без этого двойной
   * клик создавал дубль, а неудачное создание визуально не отличалось от
   * отсутствия клика.
   */
  isSubmitting?: boolean
  /** Текст отказа рядом с кнопкой — там, где нужен свой, а не общий тост. */
  error?: string | null
}

export const Form = ({ onSubmit, onCancel, submitLabel, isSubmitting, error, children }: Props) => {
  const { t } = useTranslation()

  const handleBack = () => {
    window.history.back()
  }

  const handleCancel = () => {
    if (onCancel) onCancel()
    else handleBack()
  }

  return (
    <form onSubmit={(e) => onSubmit(e)} className="space-y-4">
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={handleBack}>
          <ArrowLeft className="size-4" />
          {t('back')}
        </Button>

        <div className="flex items-center gap-3">
          {error && <span className="text-sm text-destructive">{error}</span>}
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={handleCancel}>
            {t('cancel')}
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
            {submitLabel ?? t('create')}
          </Button>
        </div>
      </div>

      {children}
    </form>
  )
}
