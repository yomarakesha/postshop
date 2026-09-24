import { AnimatePresence, motion } from 'motion/react'
import { useCounter } from '#/shared/hooks/useCounter'
import Plus from '#/shared/assets/icons/plus.svg?react'
import { QuantityStepper } from '#/shared/ui/QuantityStepper'

interface CardCartButtonProps {
  productId: number
}

/**
 * Добавление в корзину прямо с карточки товара.
 *
 * Пока товара в корзине нет — круглая кнопка «плюс». После первого нажатия
 * превращается в счётчик «− N +» на том же месте. Лежит поверх фотографии,
 * поэтому все обработчики останавливают всплытие: карточка целиком — ссылка
 * на товар, и нажатие на счётчик не должно уводить со страницы.
 *
 * Подмена анимируется через motion, а не CSS-переходом. Кнопка и счётчик —
 * разные элементы: один размонтируется, другой появляется, и CSS-переход между
 * ними сработать не может в принципе. Раньше здесь стояли классы перехода,
 * которые не делали ничего, и подмена выглядела рывком.
 *
 * `layout` на обёртке тянет ширину от круга к пилюле, `AnimatePresence` даёт
 * содержимому разойтись. Длительности короткие: это подсказка о том, что
 * произошло, а не анимация ради анимации.
 */
export const CardCartButton = ({ productId }: CardCartButtonProps) => {
  const { quantity, add, increment, decrement } = useCounter(productId)

  const stop = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 520, damping: 34, mass: 0.6 }}
      onClick={stop}
      /* Позицию задаёт нижний ряд карточки, а не кнопка сама: пока она сама
         прижималась к правому нижнему углу, метка скидки в соседнем углу про
         неё не знала, и в узкой колонке счётчик её закрывал. shrink-0 —
         счётчик ужимать нельзя, иначе цифра съезжает с кнопок. */
      className="pointer-events-auto relative z-10 flex h-9 shrink-0 items-center justify-center
                 overflow-hidden rounded-full bg-white shadow-base"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {quantity === 0 ? (
          <motion.button
            key="add"
            type="button"
            aria-label="+"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            whileTap={{ scale: 0.9 }}
            onClick={(event) => {
              stop(event)
              add()
            }}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-blue-main
                       transition-colors duration-150 hover:bg-blue-main hover:text-white"
          >
            <Plus height={18} width={18} />
          </motion.button>
        ) : (
          <motion.div
            key="counter"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
          >
            {/* Тот же общий счётчик, что на странице товара и в корзине. */}
            <QuantityStepper
              variant="pill"
              quantity={quantity}
              onIncrement={increment}
              onDecrement={decrement}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
