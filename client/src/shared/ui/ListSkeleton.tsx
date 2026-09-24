import { Skeleton } from '#/shared/ui/Skeleton'
import { cn } from '#/shared/utils/cn'

interface Props {
  /** Сколько строк рисовать. Больше пяти-шести смысла не имеет. */
  rows?: number
  /** Высота строки: у карточек с картинкой она больше, чем у простого списка. */
  rowClassName?: string
  className?: string
}

/**
 * Заглушка списка на время загрузки.
 *
 * Вместо крутилки по центру. Крутилка сообщает «идёт загрузка» и ничего не
 * говорит о том, что появится: страница сначала пустая, потом резко занята —
 * содержимое как будто прыгает. Заглушка держит место под будущие строки, и
 * появление данных выглядит как проявление, а не как скачок.
 */
export const ListSkeleton = ({ rows = 4, rowClassName, className }: Props) => {
  return (
    <div className={cn('flex flex-col gap-2', className)} aria-hidden>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className={cn('h-16 w-full', rowClassName)} />
      ))}
    </div>
  )
}
