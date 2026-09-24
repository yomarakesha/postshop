import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { ProductItem as CartProductItem } from '../StoreAccordion/ui/ProductItem'
import type { ConfirmDialogRef } from '#/shared/ui/ConfirmDialog'
import type { ModalRef } from '#/shared/ui/Modal'
import { ConfirmDialog } from '#/shared/ui/ConfirmDialog'
import { Button } from '#/shared/ui/Button'
import { useCartData } from '#/shared/hooks/useCartData'
import { useProfileStore } from '#/shared/stores/profileStore'
import { cn } from '#/shared/utils/cn'

import TrashIcon from '#/shared/assets/icons/trash.svg?react'
import CartIcon from '#/shared/assets/icons/cart.svg?react'

interface CartSidebarProps {
  loginModalRef?: React.RefObject<ModalRef | null>
}

export const CartSidebar = ({ loginModalRef }: CartSidebarProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const profile = useProfileStore((s) => s.profile)
  const [isOpen, setIsOpen] = useState(false)

  const handleConfirm = () => {
    if (profile) {
      navigate({ to: '/checkout' })
    } else {
      loginModalRef?.current?.open()
    }
  }

  const { items, stores, total, discount, grandTotal, hasUnavailable, isLoading, clearCart } =
    useCartData()
  const hasItems = items.length > 0
  const confirmClearRef = useRef<ConfirmDialogRef>(null)

  const cartContent = ({ onClose }: { onClose?: () => void } = {}) => (
    <>
      <div className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <h2 className="p2 font-semibold">{t('cart.title')}</h2>
          <div className="flex items-center gap-2">
            {hasItems && (
              /* Иконка без подписи стоит вплотную к крестику закрытия: без
                 вопроса случайный клик стирал корзину целиком. */
              <button
                className="text-passive2 hover:text-failure"
                onClick={() => confirmClearRef.current?.open()}
                aria-label={t('checkout.clearCart')}
              >
                <TrashIcon height={20} width={20} />
              </button>
            )}
            {onClose && (
              <button className="text-passive2" onClick={onClose}>
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {hasItems ? (
        <>
          {/* Прокручивается список, а не панель целиком: иначе до кнопки с
              суммой приходилось докручивать. */}
          <div className="no-scrollbar flex-1 overflow-y-auto px-4">
            <hr className="border-stroke mt-4" />
            {isLoading ? (
              <div className="flex flex-col gap-3 mt-4">
                {Array.from({ length: items.length }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-base bg-gray-200" />
                ))}
              </div>
            ) : (
              /* Раньше позиции были сгруппированы по магазинам: над каждой
                 группой стоял заголовок с названием и счётчиком, и на три
                 товара уходило три лишних строки. Магазин виден в заказе, а в
                 корзине важнее сами товары — список стал плоским. */
              /* Позиция появляется и уходит плавно: раньше список дёргался —
                 товар возникал рывком, а остальные строки прыгали вниз. */
              <motion.div layout className="flex flex-col divide-y divide-stroke">
                <AnimatePresence initial={false}>
                  {stores
                    .flatMap((store) => store.products)
                    .map((product) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <CartProductItem product={product} />
                      </motion.div>
                    ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          <div className="flex flex-col gap-4 p-4 border-t border-stroke">
            {/* Отдельных строк «Итого» и «Скидка» больше нет: на кнопке стоит
                сумма к оплате, а рядом — зачёркнутая цена без скидки, мельче и
                приглушённее. Так выгода видна там же, где итог, и над кнопкой
                не остаётся двух почти одинаковых чисел. */}
            {hasUnavailable && <p className="t1 text-failure">{t('cart.hasUnavailable')}</p>}
            <Button
              disabled={hasUnavailable}
              onClick={handleConfirm}
              /* group ставится только на живой кнопке: у отключённой наведение
                 не должно обещать действие, которого не будет. */
              className={cn(
                'p3 justify-center font-bold whitespace-nowrap',
                !hasUnavailable && 'group',
              )}
            >
              {/* Под курсором сумма уступает место действию: пока человек
                  смотрит на корзину, важна цена, а под курсором — что
                  произойдёт по нажатию. Оба слоя лежат в одной ячейке grid,
                  иначе кнопка меняла бы ширину вместе с текстом.

                  Смена идёт по очереди, а не одновременно: при одновременном
                  затухании оба текста в середине перехода видны разом и
                  наложены друг на друга — плавность есть, а выглядит как
                  мгновенная подмена. Поэтому уходящий текст исчезает первым,
                  а приходящий выходит с задержкой. На обратном движении
                  задержки меняются местами.

                  Анимируется пара [opacity, translate], а НЕ transform: в
                  Tailwind 4 translate-y-* пишет отдельное свойство translate,
                  и с transition-[opacity,transform] сдвиг не анимировался
                  вовсе — текст прыгал на 4px, пока прозрачность плыла. Отсюда
                  и ощущение рывка. Оба свойства композитные, слой поднят
                  заранее (transform-gpu), поэтому кадры не требуют перерисовки
                  текста.

                  Тайминги вдвое короче прежних: 100 мс на слой и 75 мс сдвиг
                  между ними — 175 мс на всю смену вместо 300 мс. Прежняя
                  раскладка (150 + 150) оставляла посреди перехода кадр, где
                  кнопка пуста, и наведение отзывалось с заметным опозданием. */}
              <span className="grid">
                {/* Внутренняя обёртка: items-baseline на самой кнопке ломал
                    выравнивание по вертикали, и текст прижимался к верхнему
                    краю. Кнопка центрирует обёртку, обёртка ставит числа на
                    одну базовую линию. */}
                <span className="col-start-1 row-start-1 flex transform-gpu items-baseline justify-center gap-2 transition-[opacity,translate] delay-75 duration-100 ease-out group-hover:-translate-y-1 group-hover:opacity-0 group-hover:delay-0 group-focus-visible:-translate-y-1 group-focus-visible:opacity-0 group-focus-visible:delay-0 motion-reduce:transition-none">
                  <span>
                    {grandTotal.toFixed(2)} {t('dashboard.revenue.currency')}
                  </span>
                  {discount > 0 && (
                    <span className="t1 font-medium text-white/60 line-through">
                      {total.toFixed(2)} {t('dashboard.revenue.currency')}
                    </span>
                  )}
                </span>
                <span
                  aria-hidden
                  className="col-start-1 row-start-1 flex translate-y-1 transform-gpu items-center justify-center opacity-0 transition-[opacity,translate] delay-0 duration-100 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-hover:delay-75 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:delay-75 motion-reduce:transition-none"
                >
                  {t('checkout.placeOrder')}
                </span>
              </span>
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col justify-center items-center flex-1 gap-6">
            <img src="/illustrations/cart.png" className="size-24.5" />
            <div className="text-center">
              <p className="p font-semibold">{t('cart.empty')}</p>
              <p className="t1 font-medium text-passive2">{t('cart.emptyHint')}</p>
            </div>
          </div>
          <Button disabled variant="tertiary" className="mx-4 mb-4">
            {t('cart.goToCart')}
          </Button>
        </>
      )}
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      {/* С товарами панель по их высоте (но не выше экрана), чтобы внизу
          страницы не торчать ниже списка. Пустая — во весь экран, как было:
          иначе она сжималась в короткую плашку с картинкой. */}
      <aside
        className={`
          hidden sidebar:flex flex-col
          w-full max-w-82.5
          ${hasItems ? 'max-h-[calc(100vh-var(--page-content-top-padding)-24px)]' : 'h-[calc(100vh-var(--page-content-top-padding)-24px)]'}
          sticky top-(--page-content-top-padding) self-start
          bg-white rounded-base overflow-hidden
        `}
      >
        {cartContent()}
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(true)}
        className="sidebar:hidden fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-white border border-stroke border-r-0 rounded-l-xl px-1.5 py-3 flex flex-col items-center gap-1.5 shadow-base text-passive2"
        aria-label={t('cart.title')}
      >
        <div className="relative">
          <CartIcon width={18} height={18} />
          {hasItems && (
            <span className="absolute -top-1.5 -right-2 min-w-4 h-4 flex items-center justify-center rounded-full bg-failure text-white text-[10px] font-semibold px-0.5">
              {items.length > 99 ? '99+' : items.length}
            </span>
          )}
        </div>
        <span className="t2 font-medium [writing-mode:vertical-lr]">{t('cart.title')}</span>
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-60 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              key="drawer"
              className="fixed top-0 right-0 bottom-0 z-60 w-82.5 bg-white shadow-xl flex flex-col overflow-hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <div className="overflow-y-auto no-scrollbar flex-1 flex flex-col">
                {cartContent({ onClose: () => setIsOpen(false) })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog
        ref={confirmClearRef}
        title={t('cartClear.title')}
        text={t('cartClear.text')}
        confirmLabel={t('cartClear.confirm')}
        destructive
        onConfirm={clearCart}
      />
    </>
  )
}
