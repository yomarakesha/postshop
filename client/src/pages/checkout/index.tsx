import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { PaymentType } from './ui/PaymentType'
import { DeliveryMethod } from './ui/DeliveryMethod'
import { DeliveryInfoModal } from './ui/DeliveryInfoModal'
import type { ModalRef } from '#/shared/ui/Modal'
import { BackLink } from '#/shared/ui/BackLink'
import { Button } from '#/shared/ui/Button'
import { TextArea } from '#/shared/ui/TextArea'
import { StoreAccordion } from '#/widgets/StoreAccordion'
import { OrderSuccessModal } from '#/widgets/OrderSuccessModal'
import { useCartData } from '#/shared/hooks/useCartData'
import {
  useCreateAddressUserAddressesPost,
  useCreateOrderOrdersPost,
} from '#/shared/openapi/queries'
import { useListAddressesUserAddressesGetKey } from '#/shared/openapi/queries/common'
import { PaymentType as PaymentTypeEnum } from '#/shared/openapi/requests/types.gen'
import { settled } from '#/shared/lib/settled'

const INSUFFICIENT_STOCK_RE = /Insufficient stock\. product (\d+):/

export const CheckoutPage = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { stores, total, discount, grandTotal, hasUnavailable, isLoading } = useCartData()

  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  // -1 значит «адрес введён руками»; номера сохранённых адресов положительные.
  const [deliveryAddressId, setDeliveryAddressId] = useState(-1)
  const [saveAddress, setSaveAddress] = useState(false)
  const [saveAddressTitle, setSaveAddressTitle] = useState('')
  const [pickupPointId, setPickupPointId] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [paymentType, setPaymentType] = useState<PaymentTypeEnum>(PaymentTypeEnum.CASH)
  const [orderError, setOrderError] = useState<string | null>(null)
  const successModalRef = useRef<ModalRef>(null)

  const queryClient = useQueryClient()
  const createAddress = useCreateAddressUserAddressesPost()

  const { mutate: createOrder, isPending } = useCreateOrderOrdersPost(undefined, {
    onSuccess: () => {
      successModalRef.current?.open()

      // Адрес сохраняем ПОСЛЕ заказа: заказ здесь главное, а сохранение —
      // удобство на будущее. Сохраняли бы до — при неудачном заказе в списке
      // оставался бы адрес, которым человек так и не воспользовался.
      if (saveAddress && deliveryAddress.trim()) {
        void settled(
          createAddress.mutateAsync({
            body: {
              // Без названия адрес всё равно надо как-то назвать: берём начало
              // самого адреса, чтобы запись не осталась безымянной.
              title: saveAddressTitle.trim() || deliveryAddress.trim().slice(0, 100),
              address: deliveryAddress.trim(),
            },
          }),
        ).then(() =>
          queryClient.invalidateQueries({ queryKey: [useListAddressesUserAddressesGetKey] }),
        )
      }
    },
    onError: (err) => {
      const detail = (err as { detail?: unknown }).detail
      const match = typeof detail === 'string' ? detail.match(INSUFFICIENT_STOCK_RE) : null

      if (match) {
        const productId = Number(match[1])
        const productName = stores
          .flatMap((store) => store.products)
          .find((product) => product.id === productId)?.name

        setOrderError(
          productName
            ? t('checkout.insufficientStock', { product: productName })
            : t('checkout.insufficientStockGeneric'),
        )
        return
      }

      setOrderError(t('checkout.orderError'))
    },
  })

  const handleConfirm = () => {
    setOrderError(null)

    // Сервер требует либо адрес доставки, либо пункт выдачи и иначе отвечает 422.
    // Проверяем это здесь, чтобы человек увидел, чего не хватает, а не общее
    // «попробуйте ещё раз» на заведомо непроходимый запрос.
    const address = deliveryMethod === 'delivery' ? deliveryAddress.trim() : ''
    if (deliveryMethod === 'delivery' && !address) {
      setOrderError(t('checkout.addressRequired'))
      return
    }
    if (deliveryMethod === 'pickup' && !pickupPointId) {
      setOrderError(t('checkout.pickupPointRequired'))
      return
    }

    createOrder({
      throwOnError: true,
      body: {
        payment_type: paymentType,
        delivery_address: deliveryMethod === 'delivery' ? address : null,
        pickup_point_id: deliveryMethod === 'pickup' ? pickupPointId : null,
        comment: comment.trim() || null,
      },
    })
  }

  const isEmpty = !isLoading && stores.length === 0

  if (isEmpty) {
    return (
      <div className="max-w-280.5 mx-auto">
        <div className="flex flex-col items-center justify-center py-24 gap-6">
          <img src="/illustrations/cart.png" className="size-24.5" />
          <div className="text-center">
            <p className="p font-semibold">{t('cart.empty')}</p>
            <p className="t1 font-medium text-passive2">{t('cart.emptyHint')}</p>
          </div>
          <Button variant="primary" onClick={() => router.history.back()}>
            {t('links.back')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-280.5 mx-auto">
      <BackLink href="/" title="links.back" />
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="font-bold">{t('checkout.confirmOrder')}</h1>
      </div>
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-7 items-start mt-4 lg:mt-8">
        {/* Left side */}
        <div className="w-full flex flex-col gap-4">
          <DeliveryMethod
            value={deliveryMethod}
            onChange={setDeliveryMethod}
            address={deliveryAddress}
            onAddressChange={setDeliveryAddress}
            pickupPointId={pickupPointId}
            onPickupPointChange={setPickupPointId}
            addressId={deliveryAddressId}
            onAddressIdChange={setDeliveryAddressId}
            saveAddress={saveAddress}
            onSaveAddressChange={setSaveAddress}
            saveAddressTitle={saveAddressTitle}
            onSaveAddressTitleChange={setSaveAddressTitle}
          />
          <PaymentType value={paymentType} onChange={setPaymentType} />
          <div className="bg-white p-4 rounded-base">
            <TextArea
              label={t('checkout.comment')}
              placeholder={t('checkout.commentPlaceholder')}
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>
        {/* Right side */}
        <div
          className={`
            w-full lg:max-w-85
            bg-white rounded-base flex flex-col overflow-hidden
          `}
        >
          <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3">
            {isLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-base bg-gray-200" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {stores.map((store) => (
                  <StoreAccordion key={store.id} store={store} />
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 p-4 border-t border-stroke">
            {deliveryMethod === 'delivery' && (
              <div className="self-center">
                <DeliveryInfoModal />
              </div>
            )}

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
            </div>

            {/* Стоимость доставки заполняет платформа при подтверждении заказа:
                тарифа или расчёта в API нет. Раньше покупатель видел итог без
                доставки и платил больше — теперь итог честно назван
                предварительным. */}
            <p className="t2 text-passive2">{t('checkout.deliveryLater')}</p>

            {orderError && <p className="t2 text-failure text-center">{orderError}</p>}
            {hasUnavailable && (
              <p className="t2 text-failure text-center">{t('cart.hasUnavailable')}</p>
            )}

            <Button
              disabled={isPending || hasUnavailable}
              onClick={handleConfirm}
              className="justify-center whitespace-nowrap t1"
            >
              {t('checkout.placeOrder')} · {grandTotal.toFixed(2)} {t('dashboard.revenue.currency')}
            </Button>
          </div>
        </div>
      </div>

      <OrderSuccessModal
        ref={successModalRef}
        onGoHome={() => router.navigate({ to: '/' })}
        onShowOrder={() => router.navigate({ to: '/profile' })}
      />
    </div>
  )
}
