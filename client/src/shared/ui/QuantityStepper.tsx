import { AnimatePresence, motion } from 'motion/react'
import Plus from '#/shared/assets/icons/plus.svg?react'
import Minus from '#/shared/assets/icons/minus.svg?react'
import { cn } from '#/shared/utils/cn'

type Variant = 'pill' | 'bar' | 'plain'

interface Props {
  quantity: number
  onIncrement: () => void
  onDecrement: () => void
  /**
   * `pill` — белая пилюля на фотографии карточки.
   * `bar` — синяя полоса во всю ширину на странице товара.
   * `plain` — серая плашка в корзине.
   */
  variant?: Variant
  /** Размер иконок: у полосы во всю ширину они крупнее. */
  iconSize?: number
  className?: string
  /** Подписи для читалок экрана: минус и плюс без текста ничего не говорят. */
  decreaseLabel?: string
  increaseLabel?: string
}

const shells: Record<Variant, string> = {
  pill: 'h-9 gap-1 rounded-full bg-white px-1.5 shadow-base',
  bar: 'h-12 w-full justify-between rounded-base bg-blue-main px-3.5',
  plain: 'gap-3 rounded-base bg-gray2 px-2 py-1',
}

const buttons: Record<Variant, string> = {
  pill: 'size-6 rounded-full text-blue-main hover:bg-gray2',
  bar: 'size-8 rounded-full text-white hover:bg-white/15',
  plain: 'size-7 rounded-full text-text hover:bg-white',
}

const numbers: Record<Variant, string> = {
  pill: 't1 min-w-5 font-semibold',
  bar: 'p1 min-w-8 font-semibold text-white',
  plain: 'p3 min-w-6 font-semibold',
}

/**
 * Счётчик количества: минус, число, плюс.
 *
 * Один компонент вместо трёх копий. Раньше этот элемент существовал в карточке
 * товара, на странице товара и в корзине — тремя независимыми кусками разметки
 * с разным поведением: в карточке нажатие отзывалось, на странице товара и в
 * корзине не отзывалось никак, а число везде «щёлкало» без перехода. Разное
 * поведение у одного и того же элемента читается как неисправность, даже когда
 * каждый кусок сам по себе работает.
 *
 * Число меняется сдвигом вверх-вниз: при быстром нажатии иначе не видно, что
 * счётчик отреагировал, — цифра просто подменяется.
 */
export const QuantityStepper = ({
  quantity,
  onIncrement,
  onDecrement,
  variant = 'pill',
  iconSize = 16,
  className,
  decreaseLabel = '−',
  increaseLabel = '+',
}: Props) => {
  return (
    <div className={cn('flex items-center', shells[variant], className)}>
      <motion.button
        type="button"
        aria-label={decreaseLabel}
        whileTap={{ scale: 0.85 }}
        transition={{ duration: 0.12 }}
        onClick={onDecrement}
        className={cn(
          'flex shrink-0 items-center justify-center transition-colors',
          buttons[variant],
        )}
      >
        <Minus height={iconSize} width={iconSize} />
      </motion.button>

      <span className={cn('overflow-hidden text-center tabular-nums', numbers[variant])}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={quantity}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.13, ease: 'easeOut' }}
            className="block"
          >
            {quantity}
          </motion.span>
        </AnimatePresence>
      </span>

      <motion.button
        type="button"
        aria-label={increaseLabel}
        whileTap={{ scale: 0.85 }}
        transition={{ duration: 0.12 }}
        onClick={onIncrement}
        className={cn(
          'flex shrink-0 items-center justify-center transition-colors',
          buttons[variant],
        )}
      >
        <Plus height={iconSize} width={iconSize} />
      </motion.button>
    </div>
  )
}
