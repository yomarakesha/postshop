import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useCounter } from '#/shared/hooks/useCounter'
import { Button } from '#/shared/ui/Button'
import { QuantityStepper } from '#/shared/ui/QuantityStepper'

interface CounterButtonProps {
  productId: number
  /** Товара нет в наличии: класть в корзину нечего. */
  outOfStock?: boolean
  /** Сколько ещё можно взять; больше счётчик не даёт. */
  max?: number
}

/**
 * «В корзину», превращающееся в счётчик.
 *
 * Счётчик — общий компонент: раньше здесь лежала третья копия той же разметки,
 * и в отличие от карточки товара она не отзывалась на нажатие и «щёлкала»
 * цифрами. Подмена кнопки на счётчик тоже анимируется — это разные элементы,
 * и CSS-переход между ними невозможен.
 *
 * Товар без остатка в корзину не кладётся: кнопка гаснет и прямо говорит
 * «нет в наличии». Раньше она оставалась живой, товар ложился в корзину, а
 * отказ приходил в самом конце оформления.
 */
export const CounterButton = ({ productId, outOfStock, max }: CounterButtonProps) => {
  const { t } = useTranslation()
  const { quantity, add, increment, decrement } = useCounter(productId)
  const atLimit = max !== undefined && quantity >= max

  return (
    <AnimatePresence mode="wait" initial={false}>
      {quantity === 0 ? (
        <motion.div
          key="add"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          <Button variant="primary" className="w-full" disabled={outOfStock} onClick={add}>
            {outOfStock ? t('products.outOfStock') : t('product.addToCart')}
          </Button>
        </motion.div>
      ) : (
        <motion.div
          key="counter"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          <QuantityStepper
            variant="bar"
            iconSize={24}
            quantity={quantity}
            onIncrement={atLimit ? () => {} : increment}
            onDecrement={decrement}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
