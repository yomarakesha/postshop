import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { ShoppingCart } from 'lucide-react'
import type { ConfirmDialogRef } from '#/shared/ui/ConfirmDialog'
import { EmptyState } from '#/shared/ui/EmptyState'
import { ConfirmDialog } from '#/shared/ui/ConfirmDialog'
import { ProductItem } from '#/widgets/StoreAccordion/ui/ProductItem'
import { Button } from '#/shared/ui/Button'
import { useCartData } from '#/shared/hooks/useCartData'
import TrashIcon from '#/shared/assets/icons/trash.svg?react'

export const CartPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { items, stores, total, discount, grandTotal, hasUnavailable, isLoading, clearCart } =
    useCartData()
  const hasItems = items.length > 0
  const confirmClearRef = useRef<ConfirmDialogRef>(null)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-base bg-gray-200" />
        ))}
      </div>
    )
  }

  if (!hasItems) {
    return (
      <EmptyState
        variant="plain"
        icon={<ShoppingCart size={48} strokeWidth={1.5} />}
        title={t('cart.empty')}
        hint={t('cart.emptyHint')}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="p2 font-bold">{t('cart.title')}</h1>
        {/* Раньше очистка происходила сразу по нажатию: один случайный клик
            стирал корзину целиком, без вопроса и без возможности вернуть. */}
        <Button
          className="bg-gray3 text-text px-4"
          size="md"
          leftIcon={<TrashIcon height={20} width={20} />}
          onClick={() => confirmClearRef.current?.open()}
        >
          {t('checkout.clearCart')}
        </Button>
      </div>

      {/* Плоский список, как в боковой корзине: группировка по магазинам
          добавляла заголовок над каждой группой. На оформлении заказа
          группировка осталась — там важно, что из какого магазина едет. */}
      <div className="flex flex-col divide-y divide-stroke rounded-base bg-white p-4">
        {stores
          .flatMap((store) => store.products)
          .map((product) => (
            <ProductItem key={product.id} product={product} />
          ))}
      </div>

      <div className="bg-white rounded-base flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-2 p3">
          <div className="flex justify-between">
            <p className="font-medium">{t('cart.total')}</p>
            <p className="font-semibold">
              {total.toFixed(2)} {t('dashboard.revenue.currency')}
            </p>
          </div>

          {discount > 0 && (
            <div className="flex justify-between">
              <p className="font-medium text-failure">{t('cart.discount')}</p>
              <p className="font-semibold text-failure">
                -{discount.toFixed(2)} {t('dashboard.revenue.currency')}
              </p>
            </div>
          )}

          <div className="flex justify-between">
            <p className="font-bold">{t('cart.grandTotal')}</p>
            <p className="font-semibold">
              {grandTotal.toFixed(2)} {t('dashboard.revenue.currency')}
            </p>
          </div>
        </div>

        {/* С недоступной позицией сервер всё равно откажет: лучше объяснить
            причину здесь, чем показать ошибку после нажатия. */}
        {hasUnavailable && <p className="t1 text-failure">{t('cart.hasUnavailable')}</p>}
        {/* Кнопка ведёт на оформление, поэтому так и называется. «В корзину»
            на странице корзины ничего не объясняло — и в разделе Китая на том
            же месте стоит «Оформить заказ». */}
        <Button disabled={hasUnavailable} onClick={() => navigate({ to: '/checkout' })}>
          {t('checkout.placeOrder')}
        </Button>
      </div>
      <ConfirmDialog
        ref={confirmClearRef}
        title={t('cartClear.title')}
        text={t('cartClear.text')}
        confirmLabel={t('cartClear.confirm')}
        destructive
        onConfirm={clearCart}
      />
    </div>
  )
}
