import { cn } from '../utils/cn'
import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  required?: boolean
  rows?: number
  /**
   * Рекомендуемая длина. Показывается счётчиком под полем и подсвечивается,
   * когда её превысили, но ввод не ограничивает: писать больше можно, просто
   * в карточке товара текст будет обрезан многоточием.
   */
  recommendedLength?: number
  /** Подпись счётчика, например «символов». */
  counterHint?: string
}

export const TextArea = ({
  className,
  label,
  required,
  rows,
  recommendedLength,
  counterHint,
  ...rest
}: Props) => {
  const length = String(rest.value ?? '').length
  const over = recommendedLength !== undefined && length > recommendedLength

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="p3 font-medium">
          {label} {required && <span className="text-failure">*</span>}
        </label>
      )}
      <textarea
        className={cn(
          'w-full p3 px-3 py-2.5 border border-border rounded-base placeholder:text-passive1',
          'resize-none focus:border-blue-main',
          className,
        )}
        rows={rows}
        {...rest}
      />
      {recommendedLength !== undefined && (
        <div className="flex items-baseline justify-between gap-2">
          {over && counterHint && <span className="t2 text-warning">{counterHint}</span>}
          <span className={cn('t2 ml-auto tabular-nums', over ? 'text-warning' : 'text-passive2')}>
            {length} / {recommendedLength}
          </span>
        </div>
      )}
    </div>
  )
}
