import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { cn } from '#/shared/utils/cn'
import { FALLBACK_CURRENCY } from '#/shared/constants/locale'
import TrashIcon from '#/shared/assets/icons/trash.svg?react'
import { QuantityStepper } from '#/shared/ui/QuantityStepper'
import { useCartStore } from '#/shared/stores/cartStore'
import { useProfileStore } from '#/shared/stores/profileStore'
import {
  useRemoveFromCartCartProductIdDelete,
  useUpdateCartItemCartProductIdPut,
} from '#/shared/openapi/queries'
import { useGetCartCartGetKey } from '#/shared/openapi/queries/common'

interface CartProduct {
  id: number
  name: string
  image?: string
  price: number
  oldPrice?: number
  quantity: number
  currencyCode?: string
  isAvailable?: boolean
}

export const ProductItem = ({ product }: { product: CartProduct }) => {
  const { t } = useTranslation()
  const profile = useProfileStore((s) => s.profile)
  const updateQuantityLocal = useCartStore((s) => s.updateQuantity)
  const queryClient = useQueryClient()

  const updateCartItem = useUpdateCartItemCartProductIdPut()
  const removeFromCart = useRemoveFromCartCartProductIdDelete()

  const invalidateCart = () => queryClient.invalidateQueries({ queryKey: [useGetCartCartGetKey] })

  // Удаление не мгновенное: позиция остаётся на месте приглушённой, и пять
  // секунд её можно вернуть. Иначе один случайный клик по «−» на последней
  // единице стирал товар без всякой возможности отменить.
  // Товар мог стать недоступным уже после того, как попал в корзину: магазин
  // закрылся, товар сняли с продажи. Позицию оставляем, но заказать её нельзя,
  // поэтому счётчик уступает место понятной подписи и кнопке «удалить».
  const isUnavailable = product.isAvailable === false
  const currency = product.currencyCode ?? FALLBACK_CURRENCY

  const UNDO_MS = 5000
  const [pendingRemoval, setPendingRemoval] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const removeNow = () => {
    if (profile) {
      removeFromCart.mutate({ path: { product_id: product.id } }, { onSuccess: invalidateCart })
    } else {
      updateQuantityLocal(product.id, 0)
    }
  }

  const scheduleRemoval = () => {
    setPendingRemoval(true)
    timerRef.current = setTimeout(removeNow, UNDO_MS)
  }

  const cancelRemoval = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
    setPendingRemoval(false)
  }

  // При закрытии корзины таймер снимается, а товар остаётся: молча удалять
  // то, что человек уже не видит, хуже, чем оставить лишнюю позицию.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleUpdate = (newQuantity: number) => {
    if (newQuantity <= 0) {
      scheduleRemoval()
      return
    }
    if (profile) {
      if (newQuantity <= 0) {
        removeFromCart.mutate({ path: { product_id: product.id } }, { onSuccess: invalidateCart })
      } else {
        updateCartItem.mutate(
          { path: { product_id: product.id }, body: { quantity: newQuantity } },
          { onSuccess: invalidateCart },
        )
      }
    } else {
      updateQuantityLocal(product.id, newQuantity)
    }
  }

  // Размеры строки те же, что в корзине раздела Китая: два одинаковых по
  // смыслу списка стояли рядом и выглядели по-разному.
  return (
    <div className="flex flex-col gap-2 py-3">
      <div
        className={cn(
          'flex items-center gap-3 transition-opacity duration-200',
          (pendingRemoval || isUnavailable) && 'opacity-40',
        )}
      >
        {/* Фото и название — ссылка на товар: раньше из корзины нельзя было
            вернуться к его странице, приходилось искать заново. */}
        <Link
          to="/$productId"
          params={{ productId: String(product.id) }}
          className="flex min-w-0 flex-1 items-center gap-3"
        >
          <img
            src={product.image}
            alt={product.name}
            className="rounded-base bg-gray2 size-10 shrink-0 object-cover"
          />
          <p className="t1 line-clamp-2 flex-1">{product.name || t('cart.unavailableName')}</p>
        </Link>
        <button
          onClick={() => handleUpdate(0)}
          className="text-passive2 hover:text-failure shrink-0 p-1 -m-1"
          aria-label="Remove"
        >
          <TrashIcon height={18} width={18} />
        </button>
      </div>
      <div className="flex items-center justify-between">
        {/* min-w-0 + flex-wrap, а цены внутри — nowrap. Порядок переносов здесь
            задаётся явно, потому что сам по себе он получался худшим из
            возможных: место в колонке корзины делили счётчик и две цены, цены
            ужимались первыми и рвались по пробелу — «16650.00» на одной строке,
            «tmt» на следующей. Число в отрыве от валюты не читается. Теперь
            каждая цена неразрывна, а на вторую строку при нехватке места
            уходит старая цена целиком. */}
        <div
          className={cn(
            'flex min-w-0 flex-wrap items-center gap-x-2 transition-opacity duration-200',
            pendingRemoval && 'opacity-40',
          )}
        >
          {isUnavailable ? (
            <p className="t1 text-failure font-medium">{t('cart.unavailable')}</p>
          ) : (
            <>
              {/* Валюта была голым текстом в разметке, тогда как карточки
                  товаров читали её из данных: два источника для одного и того
                  же значения. */}
              <p
                className={cn('t1 font-bold whitespace-nowrap', product.oldPrice && 'text-failure')}
              >
                {product.price.toFixed(2)} {currency}
              </p>
              {product.oldPrice && (
                <p className="t2 text-passive2 line-through whitespace-nowrap">
                  {product.oldPrice.toFixed(2)} {currency}
                </p>
              )}
            </>
          )}
        </div>
        {/* На месте счётчика — кнопка возврата: отдельной подписи «товар
            удалён» над позицией больше нет, состояние читается по приглушённой
            строке и по самой кнопке. */}
        {isUnavailable ? (
          <button
            onClick={removeNow}
            className="t1 shrink-0 rounded-base bg-gray2 px-4 py-2 font-semibold
                       text-failure transition-colors hover:bg-gray3"
          >
            {t('cart.remove')}
          </button>
        ) : pendingRemoval ? (
          <button
            onClick={cancelRemoval}
            className="t1 shrink-0 rounded-base bg-gray2 px-4 py-2 font-semibold
                       text-text transition-colors hover:bg-gray3"
          >
            {t('cart.restore')}
          </button>
        ) : (
          /* Общий счётчик вместо третьей копии разметки: здесь нажатие не
             отзывалось и число «щёлкало» без перехода, в отличие от карточки
             товара. Один и тот же элемент, ведущий себя по-разному в разных
             местах, читается как неисправность. */
          <QuantityStepper
            variant="plain"
            className="shrink-0"
            quantity={product.quantity}
            onIncrement={() => handleUpdate(product.quantity + 1)}
            onDecrement={() => handleUpdate(product.quantity - 1)}
            decreaseLabel={t('cart.decrease')}
            increaseLabel={t('cart.increase')}
          />
        )}
      </div>
    </div>
  )
}
