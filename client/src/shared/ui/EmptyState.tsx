import type { ReactNode } from 'react'
import { cn } from '#/shared/utils/cn'

interface Props {
  /** Значок сверху. Приглушённый и тонкий: он поясняет, а не привлекает. */
  icon?: ReactNode
  title: string
  /** Что делать дальше. Без него пустой экран только сообщает, но не помогает. */
  hint?: string
  /** Действие, если оно есть: «Перейти в каталог», «Добавить адрес». */
  action?: ReactNode
  /** `card` — на белой карточке, `plain` — прямо на странице. */
  variant?: 'card' | 'plain'
  className?: string
}

/**
 * Пустое состояние — одно на всю витрину.
 *
 * До этого их было четыре вида: где-то значок с двумя строками, где-то просто
 * серая строка на карточке, где-то строка без карточки, где-то ничего. Один и
 * тот же смысл, показанный четырьмя способами, читается как четыре разных
 * экрана — интерфейс выглядит собранным из кусков.
 */
export const EmptyState = ({ icon, title, hint, action, variant = 'card', className }: Props) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 text-center',
        variant === 'card' ? 'rounded-base bg-white py-14 shadow-base' : 'py-20',
        className,
      )}
    >
      {icon && <span className="text-passive1">{icon}</span>}
      <div className="flex flex-col gap-1">
        <p className="p3 font-medium text-passive2">{title}</p>
        {hint && <p className="t1 text-passive1">{hint}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
