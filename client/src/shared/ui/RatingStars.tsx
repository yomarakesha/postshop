import { Star } from 'lucide-react'
import { cn } from '#/shared/utils/cn'

interface Props {
  /** Оценка 0..5; дробная закрашивает звезду частично. Decimal приходит строкой. */
  value: number | string
  size?: number
  className?: string
  /** Показать оценку числом рядом со звёздами. */
  showValue?: boolean
  /** Сколько оценок — в скобках после числа. */
  count?: number
}

/**
 * Звёзды рейтинга.
 *
 * Дробная часть закрашивается наложением: пять звёзд в фоне и те же пять
 * поверх, обрезанные по ширине. Округлять до целых нельзя — 4.5 и 4.9
 * выглядели бы одинаково, а разница между ними для покупателя существенна.
 */
export const RatingStars = ({ value, size = 14, className, showValue, count }: Props) => {
  const clamped = Math.min(5, Math.max(0, Number(value) || 0))

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="relative inline-flex shrink-0">
        <span className="inline-flex">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} width={size} height={size} className="text-stroke" fill="none" />
          ))}
        </span>
        <span
          className="absolute inset-0 inline-flex overflow-hidden"
          style={{ width: `${(clamped / 5) * 100}%` }}
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              width={size}
              height={size}
              className="shrink-0 text-warning"
              fill="currentColor"
            />
          ))}
        </span>
      </span>
      {showValue && <span className="t1 font-medium">{clamped.toFixed(1)}</span>}
      {count !== undefined && <span className="t2 text-passive2">({count})</span>}
    </span>
  )
}
