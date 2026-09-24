import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ExpandableStore } from './ui/ExpandableStore'
import type { ReactNode } from 'react'
import type { PaymentType, PickupPointResponse } from '#/shared/openapi/requests/types.gen'
import type { ModalRef } from '#/shared/ui/Modal'
import DoneIcon from '#/shared/assets/icons/order-statuses/done.svg?react'
import CancelledIcon from '#/shared/assets/icons/order-statuses/cancelled.svg?react'
import InProgressIcon from '#/shared/assets/icons/order-statuses/in-progress.svg?react'
import PendingIcon from '#/shared/assets/icons/order-statuses/pending.svg?react'
import { Button } from '#/shared/ui/Button'
import { Modal } from '#/shared/ui/Modal'

export type OrderStatus = 'done' | 'cancelled' | 'pending' | 'in_progress' | 'attention'

interface OrderProduct {
  /** Номер строки заказа: он уникален и служит ключом списка. */
  id: number
  /**
   * Номер самого товара.
   *
   * Отдельное поле, потому что `id` — это строка заказа, а не товар. Действие
   * над товаром (оценить) требует именно товара, и раньше туда уходил номер
   * строки: сервер отвечал «этот товар вы не покупали».
   */
  productId: number
  name: string
  price: number
  quantity: number
  image?: string
  warning?: string
}

interface OrderStore {
  id: number
  name: string
  logo?: string
  products: Array<OrderProduct>
  collapsed?: boolean
}

interface Props {
  id: number
  status: OrderStatus
  stores: Array<OrderStore>
  subtotal: number
  discount: number
  total: number
  deliveryPrice?: number | null
  paymentType?: PaymentType | null
  deliveryAddress?: string | null
  pickupPoint?: PickupPointResponse | null
  onCancel?: () => void
  isCancelling?: boolean
  cancelError?: string | null
  /**
   * Подпись статуса с сервера. Три разных состояния — «подтверждён»,
   * «готов к выдаче» и «готов к доставке» — показывались покупателю одним
   * «Готовится», хотя переводы статусов сервер отдаёт. Иконка по-прежнему
   * общая для «в работе»: их у нас четыре, а состояний шесть.
   */
  statusLabel?: string
  /**
   * Отмену можно предлагать. Интерфейс был строже сервера: кнопка
   * показывалась только для «ожидает», хотя сервер разрешает отмену и в
   * «подтверждён» (CUSTOMER_CANCELLABLE_STATUSES).
   */
  canCancel?: boolean
  /**
   * Часть магазинов отказалась от своих позиций, но не все. Общий статус
   * заказа этого не показывает никак, и покупатель видел бы «Подтверждён» без
   * единого намёка на то, что часть заказа до него не доедет.
   */
  partiallyRejected?: boolean
  /**
   * Действие рядом с каждым купленным товаром. Нужно покупателю в завершённом
   * заказе — оттуда оценивают товар: страница заказа единственное место, где
   * человек точно помнит, что именно он покупал.
   */
  renderProductAction?: (product: OrderProduct) => ReactNode
}

const statusIcons: Record<OrderStatus, React.ReactNode> = {
  done: <DoneIcon width={40} height={40} />,
  pending: <PendingIcon width={40} height={40} />,
  in_progress: <InProgressIcon width={40} height={40} />,
  cancelled: <CancelledIcon width={40} height={40} />,
  attention: <PendingIcon width={40} height={40} />,
}

const paymentTypeKey: Record<string, string> = {
  cash: 'checkout.cash',
  card: 'checkout.card',
  cash_and_card: 'checkout.cashAndCard',
}

export const OrderDetails = ({
  status,
  stores,
  subtotal,
  discount,
  total,
  deliveryPrice,
  paymentType,
  deliveryAddress,
  pickupPoint,
  onCancel,
  statusLabel,
  partiallyRejected,
  canCancel = false,
  isCancelling,
  cancelError,
  renderProductAction,
}: Props) => {
  const { t } = useTranslation()
  const cancelModalRef = useRef<ModalRef>(null)
  const wasCancelling = useRef(false)

  useEffect(() => {
    if (wasCancelling.current && !isCancelling) {
      if (!cancelError) {
        cancelModalRef.current?.close()
      }
      wasCancelling.current = false
    }
    if (isCancelling) {
      wasCancelling.current = true
    }
  }, [isCancelling, cancelError])

  return (
    <>
      <Modal ref={cancelModalRef} className="w-full max-w-md">
        <div className="flex flex-col gap-6 p-6">
          <div className="flex flex-col gap-2">
            <h2 className="p1 font-bold text-center">{t('orders.detail.cancelOrder')}</h2>
            <p className="p3 text-passive2 text-center">
              {t('orders.detail.cancelConfirmSubtitle')}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="tertiary"
              size="md"
              className="flex-1"
              onClick={() => cancelModalRef.current?.close()}
              disabled={isCancelling}
            >
              {t('logoutPage.cancel')}
            </Button>
            <Button
              variant="danger"
              size="md"
              className="flex-1"
              disabled={isCancelling}
              onClick={() => onCancel?.()}
            >
              {isCancelling ? '...' : t('orders.detail.cancelConfirmButton')}
            </Button>
          </div>
          {cancelError && <p className="p3 text-failure text-center">{cancelError}</p>}
        </div>
      </Modal>
      <div className="flex-1 flex flex-col bg-white rounded-base lg:self-start">
        {/* pb-4 вместо pb-0: содержимое упиралось в линию над итогами —
            и строка «Доставка», и логотип последнего магазина. */}
        <div className="p-4">
          {/* Status Header + Top Actions */}
          <div className="rounded-base flex flex-col items-center gap-4">
            {statusIcons[status]}
            <p className="p2 font-semibold">{statusLabel ?? t(`orders.status.${status}`)}</p>
            {partiallyRejected && (
              <p className="t1 text-failure">{t('orders.partiallyRejected')}</p>
            )}
            {canCancel && (
              <Button size="md" variant="danger" onClick={() => cancelModalRef.current?.open()}>
                {t('orders.detail.cancelOrder')}
              </Button>
            )}
          </div>

          {/* Store Sections */}
          <div className="mt-4 flex flex-col gap-1.5">
            {stores.map((store) => (
              <ExpandableStore
                key={store.id}
                store={store}
                status={status}
                renderProductAction={renderProductAction}
              />
            ))}
          </div>

          {/* Order Info */}
          {(paymentType || deliveryAddress || pickupPoint) && (
            <div className="mt-4 flex flex-col gap-3 border-stroke">
              {paymentType && (
                <div className="flex justify-between p3">
                  <p className="font-medium text-passive2">{t('checkout.paymentType')}</p>
                  <p className="font-semibold">
                    {t(paymentTypeKey[paymentType] ?? 'checkout.cash')}
                  </p>
                </div>
              )}
              {pickupPoint ? (
                <div className="flex justify-between gap-4 p3">
                  <p className="font-medium text-passive2">{t('checkout.pickup')}</p>
                  <p className="min-w-0 break-words font-semibold text-right">
                    {pickupPoint.name}
                    {pickupPoint.address ? `, ${pickupPoint.address}` : ''}
                  </p>
                </div>
              ) : deliveryAddress ? (
                <div className="flex justify-between gap-4 p3">
                  <p className="font-medium text-passive2">{t('checkout.delivery')}</p>
                  <p className="min-w-0 break-words font-semibold text-right">{deliveryAddress}</p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Price Summary - pinned to bottom */}
        <div className="flex flex-col gap-3 p-4 border-t border-stroke mt-auto">
          <div className="flex justify-between p3">
            <p className="font-medium">{t('orders.detail.productPrice')}</p>
            <p className="font-semibold">
              {subtotal.toFixed(2)} {t('dashboard.revenue.currency')}
            </p>
          </div>

          {discount > 0 && (
            <>
              <hr className="border-stroke" />
              <div className="flex justify-between p3">
                <p className="font-medium text-failure">{t('orders.detail.discount')}</p>
                <p className="font-semibold text-failure">
                  -{discount.toFixed(2)} {t('dashboard.revenue.currency')}
                </p>
              </div>
            </>
          )}

          {deliveryPrice != null && (
            <div className="flex justify-between p3">
              <p className="font-medium">{t('orders.detail.deliveryPrice')}</p>
              <p className="font-semibold">
                {deliveryPrice.toFixed(2)} {t('dashboard.revenue.currency')}
              </p>
            </div>
          )}

          <div className="flex justify-between p3">
            <p className="font-bold">{t('orders.detail.grandTotal')}</p>
            <p className="font-semibold">
              {total.toFixed(2)} {t('dashboard.revenue.currency')}
            </p>
          </div>
        </div>

        {/* Здесь была вторая, нерабочая копия действий над заказом: «Удалить
            товар», «Отменить заказ» и «Найти в другом магазине» — все три без
            обработчиков. Вдвойне мёртвая: статус attention нигде не
            выставлялся, поэтому ветка не отрисовывалась никогда. Рабочая
            отмена заказа есть выше в этом же файле. */}
      </div>
    </>
  )
}
