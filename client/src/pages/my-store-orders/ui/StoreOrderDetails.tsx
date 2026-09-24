import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { getStatusColor, getStatusIcon } from '../model/statusMeta'
import type { OrderResponse } from '#/shared/openapi/requests/types.gen'
import type { ModalRef } from '#/shared/ui/Modal'
import {
  LocalOrderStatusCode,
  OrderStatusCode,
  PaymentType,
} from '#/shared/openapi/requests/types.gen'
import { Button } from '#/shared/ui/Button'
import { Modal } from '#/shared/ui/Modal'
import { getImageUrl } from '#/shared/utils/getImageUrl'

interface Props {
  order: OrderResponse
  storeId: number
  onStatusUpdate: (orderId: number, status: LocalOrderStatusCode) => void
  isUpdating: boolean
  updateError: string | null
}

const paymentTypeKey: Record<string, string> = {
  [PaymentType.CASH]: 'checkout.cash',
  [PaymentType.CARD]: 'checkout.card',
  [PaymentType.CASH_AND_CARD]: 'checkout.cashAndCard',
}

export const StoreOrderDetails = ({
  order,
  storeId,
  onStatusUpdate,
  isUpdating,
  updateError,
}: Props) => {
  const { t, i18n } = useTranslation()
  const rejectModalRef = useRef<ModalRef>(null)
  const wasUpdating = useRef(false)

  useEffect(() => {
    if (wasUpdating.current && !isUpdating) {
      if (!updateError) {
        rejectModalRef.current?.close()
      }
      wasUpdating.current = false
    }
    if (isUpdating) {
      wasUpdating.current = true
    }
  }, [isUpdating, updateError])

  const statusCode = order.order_status.code
  const isOrderApproved = statusCode === OrderStatusCode.APPROVED
  const shopStatus = order.order_shops?.find((os) => os.shop_base_id === storeId)?.status
  const displayStatus = shopStatus ?? statusCode
  const StatusIcon = getStatusIcon(displayStatus)
  const storeItems = order.items.filter((item) => item.product.shop_base_id === storeId)
  const subtotal = storeItems.reduce(
    (sum, item) => sum + parseFloat(item.price_at_order) * item.quantity,
    0,
  )

  const getProductName = (translations: Array<{ language: string; name: string }>) =>
    translations.find((tr) => tr.language === i18n.language)?.name ?? translations[0]?.name

  // Последним вариантом подставлялся внутренний идентификатор («#6»): продавцу
  // он ничего не говорит, а показывать номер записи в базе не следует. Телефон
  // покупателя выводится строкой ниже, поэтому здесь достаточно пометки.
  const customerName =
    [order.user.name, order.user.surname].filter(Boolean).join(' ') ||
    order.user.username ||
    t('storeOrders.noName')

  return (
    <>
      <Modal ref={rejectModalRef} className="w-full max-w-md">
        <div className="flex flex-col gap-6 p-6">
          <div className="flex flex-col gap-2">
            <h2 className="p1 font-bold text-center">{t('storeOrders.rejectConfirmTitle')}</h2>
            <p className="p3 text-passive2 text-center">{t('storeOrders.rejectConfirmSubtitle')}</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="tertiary"
              size="md"
              className="flex-1"
              onClick={() => rejectModalRef.current?.close()}
              disabled={isUpdating}
            >
              {t('logoutPage.cancel')}
            </Button>
            <Button
              variant="danger"
              size="md"
              className="flex-1"
              disabled={isUpdating}
              onClick={() => onStatusUpdate(order.id, LocalOrderStatusCode.REJECTED)}
            >
              {isUpdating ? '...' : t('storeOrders.rejectConfirmButton')}
            </Button>
          </div>
          {updateError && <p className="p3 text-failure text-center">{updateError}</p>}
        </div>
      </Modal>

      <div className="flex-1 flex flex-col bg-white rounded-base lg:self-start">
        <div className="flex flex-col gap-4 p-4">
          {/* Status + Actions */}
          <div className="flex flex-col items-center gap-3">
            <span className={getStatusColor(displayStatus)}>
              <StatusIcon width={40} height={40} />
            </span>
            <p className={`p2 font-semibold ${getStatusColor(displayStatus)}`}>
              {t(`storeOrders.status.${displayStatus}`)}
            </p>

            {!isOrderApproved && (
              <p className="p3 text-passive2 text-center">{t('storeOrders.notApproved')}</p>
            )}

            {isOrderApproved && shopStatus === LocalOrderStatusCode.PENDING && (
              <div className="flex gap-3 w-full">
                <Button
                  variant="primary"
                  size="md"
                  className="flex-1"
                  disabled={isUpdating}
                  onClick={() => onStatusUpdate(order.id, LocalOrderStatusCode.APPROVED)}
                >
                  {t('storeOrders.approve')}
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  className="flex-1"
                  disabled={isUpdating}
                  onClick={() => rejectModalRef.current?.open()}
                >
                  {t('storeOrders.reject')}
                </Button>
              </div>
            )}

            {isOrderApproved && shopStatus === LocalOrderStatusCode.APPROVED && (
              <Button
                variant="primary"
                size="md"
                className="w-full"
                disabled={isUpdating}
                onClick={() => onStatusUpdate(order.id, LocalOrderStatusCode.READY_TO_TAKE)}
              >
                {isUpdating ? '...' : t('storeOrders.readyToPickup')}
              </Button>
            )}
          </div>

          <hr className="border-stroke" />

          {/* Items */}
          <div className="flex flex-col divide-y divide-stroke">
            {storeItems.map((item) => {
              const name = getProductName(item.product.translations)
              const image = getImageUrl(item.product.images?.[0])
              return (
                <div key={item.id} className="flex gap-3 items-center py-3">
                  <img
                    src={image}
                    alt={name}
                    className="size-16 shrink-0 rounded-lg object-cover"
                  />
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <p className="p3 line-clamp-2">{name}</p>
                    <p className="t1 text-passive2">
                      {parseFloat(item.price_at_order).toFixed(2)} {t('dashboard.revenue.currency')}{' '}
                      · {item.quantity} {t('orders.detail.pieces')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order Info */}
          <div className="flex flex-col gap-3 border-t border-stroke pt-3">
            <div className="flex justify-between gap-4 p3">
              <p className="text-passive2 font-medium shrink-0">{t('storeOrders.customer')}</p>
              <p className="min-w-0 break-words font-semibold text-right">{customerName}</p>
            </div>

            <div className="flex justify-between gap-4 p3">
              <p className="text-passive2 font-medium shrink-0">{t('store.phone')}</p>
              <p className="min-w-0 break-words font-semibold text-right">
                {order.user.phone || t('storeOrders.noPhone')}
              </p>
            </div>

            <div className="flex justify-between p3">
              <p className="text-passive2 font-medium">{t('checkout.paymentType')}</p>
              <p className="font-semibold">
                {t(paymentTypeKey[order.payment_type] ?? 'checkout.cash')}
              </p>
            </div>

            {order.pickup_point && (
              <div className="flex justify-between gap-4 p3">
                <p className="text-passive2 font-medium shrink-0">{t('checkout.pickup')}</p>
                <p className="min-w-0 break-words font-semibold text-right">
                  {order.pickup_point.name}
                  {order.pickup_point.address ? `, ${order.pickup_point.address}` : ''}
                </p>
              </div>
            )}

            {order.delivery_address && (
              <div className="flex justify-between gap-4 p3">
                <p className="text-passive2 font-medium shrink-0">{t('checkout.delivery')}</p>
                <p className="min-w-0 break-words font-semibold text-right">
                  {order.delivery_address}
                </p>
              </div>
            )}

            {order.comment && (
              <div className="flex justify-between gap-4 p3">
                <p className="text-passive2 font-medium shrink-0">{t('storeOrders.comment')}</p>
                <p className="min-w-0 break-words font-semibold text-right">{order.comment}</p>
              </div>
            )}
          </div>
        </div>

        {/* Price Summary */}
        <div className="flex flex-col gap-3 p-4 border-t border-stroke mt-auto">
          <div className="flex justify-between p3">
            <p className="font-medium">{t('orders.detail.productPrice')}</p>
            <p className="font-semibold">
              {subtotal.toFixed(2)} {t('dashboard.revenue.currency')}
            </p>
          </div>
          <hr className="border-stroke" />
          <div className="flex justify-between p3">
            <p className="font-bold">{t('orders.detail.grandTotal')}</p>
            <p className="font-semibold">
              {subtotal.toFixed(2)} {t('dashboard.revenue.currency')}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
