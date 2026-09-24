import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Package, Store, User } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { useOrderQuery } from '../model/useOrderQuery'
import { useUpdateOrderStatusMutation } from '../model/useUpdateOrderStatusMutation'
import { buildFileUrl } from '@/shared/lib/buildFileUrl'
import { formatDate } from '@/shared/lib/formatDate'
import { getTranslationName } from '@/shared/lib/getTranslationName'
import { OrderStatusCode, PaymentType, getUserUsersUserIdGet } from '@/shared/openapi/requests'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

const statusBadgeVariant: Record<
  OrderStatusCode,
  'warning' | 'info' | 'destructive' | 'success' | 'default'
> = {
  [OrderStatusCode.PENDING]: 'warning',
  [OrderStatusCode.APPROVED]: 'info',
  [OrderStatusCode.REJECTED]: 'destructive',
  [OrderStatusCode.READY_TO_TAKE]: 'info',
  [OrderStatusCode.READY_TO_DELIVER]: 'info',
  [OrderStatusCode.COMPLETED]: 'success',
}

const paymentTypeKey: Record<string, string> = {
  [PaymentType.CASH]: 'orders.payment.cash',
  [PaymentType.CARD]: 'orders.payment.card',
  [PaymentType.CASH_AND_CARD]: 'orders.payment.cashAndCard',
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const orderId = Number(id)
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const { data: orderData, isLoading } = useOrderQuery(orderId)
  const updateStatus = useUpdateOrderStatusMutation(orderId)
  const [askReject, setAskReject] = useState(false)

  const order = orderData?.data
  const userId = order?.user_id

  const { data: userData } = useQuery({
    queryKey: ['users', userId],
    queryFn: () => getUserUsersUserIdGet({ path: { user_id: userId! }, throwOnError: true }),
    enabled: userId != null,
  })

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!order) return null

  const user = userData?.data
  const statusCode = order.order_status.code

  const isDeliveryOrder = !order.pickup_point

  // onError здесь был лишним: MutationCache подавляет глобальный тост только
  // если onError объявлен в опциях самой мутации, а переданный в mutate()
  // живёт отдельно — на каждую ошибку показывались два тоста подряд.
  const handleStatusUpdate = (status: OrderStatusCode, deliveryPrice?: string | null) => {
    updateStatus.mutate({ statusCode: status, deliveryPrice })
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" onClick={() => navigate('/orders')}>
            <ArrowLeft className="size-4" />
            {t('back')}
          </Button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between rounded-xl border px-5 py-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {t('orders.orderNumber', { id: order.id })}
            </p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {formatDate(order.created_at)}
            </p>
          </div>
          <Badge variant={statusBadgeVariant[statusCode]} className="text-sm px-3 py-1">
            {t(`orders.statusLabel.${statusCode}`)}
          </Badge>
        </div>

        {/* Status Actions */}
        {statusCode !== OrderStatusCode.COMPLETED && statusCode !== OrderStatusCode.REJECTED && (
          <div className="space-y-4 rounded-xl border px-5 py-4">
            <p className="text-sm font-medium text-muted-foreground">{t('orders.actions')}</p>

            {statusCode === OrderStatusCode.PENDING &&
              (isDeliveryOrder ? (
                // Заказ с доставкой: у формы есть поле, поэтому обе кнопки
                // живут внутри неё — иначе «Отклонить» встаёт вровень с меткой
                // поля, а не с «Принять».
                <ApproveWithDeliveryPriceForm
                  isPending={updateStatus.isPending}
                  onApprove={(deliveryPrice) =>
                    handleStatusUpdate(OrderStatusCode.APPROVED, deliveryPrice)
                  }
                  onReject={() => setAskReject(true)}
                  t={t}
                />
              ) : (
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="default"
                    onClick={() => handleStatusUpdate(OrderStatusCode.APPROVED)}
                    isLoading={updateStatus.isPending}
                    disabled={updateStatus.isPending}
                  >
                    {t('orders.approve')}
                  </Button>
                  {/* Отклонение заказа делалось одним кликом без вопроса, при том
                    что покупатель сразу видит отказ. */}
                  <Button
                    variant="destructive"
                    onClick={() => setAskReject(true)}
                    isLoading={updateStatus.isPending}
                    disabled={updateStatus.isPending}
                  >
                    {t('orders.reject')}
                  </Button>
                </div>
              ))}

            {statusCode === OrderStatusCode.APPROVED && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="default"
                    onClick={() => handleStatusUpdate(OrderStatusCode.READY_TO_TAKE)}
                    isLoading={updateStatus.isPending}
                    disabled={updateStatus.isPending || !order.all_active_shops_ready}
                  >
                    {t('orders.readyToPickup')}
                  </Button>
                  {/* Отклонение заказа делалось одним кликом без вопроса, при том
                    что покупатель сразу видит отказ. */}
                  <Button
                    variant="destructive"
                    onClick={() => setAskReject(true)}
                    isLoading={updateStatus.isPending}
                    disabled={updateStatus.isPending}
                  >
                    {t('orders.reject')}
                  </Button>
                </div>
                {!order.all_active_shops_ready && (
                  <p className="text-xs text-muted-foreground">{t('orders.notAllShopsReady')}</p>
                )}
              </div>
            )}

            {statusCode === OrderStatusCode.READY_TO_TAKE && (
              <Button
                variant="default"
                onClick={() => handleStatusUpdate(OrderStatusCode.READY_TO_DELIVER)}
                isLoading={updateStatus.isPending}
                disabled={updateStatus.isPending}
              >
                {t('orders.readyToDeliver')}
              </Button>
            )}

            {statusCode === OrderStatusCode.READY_TO_DELIVER && (
              <Button
                variant="default"
                onClick={() => handleStatusUpdate(OrderStatusCode.COMPLETED)}
                isLoading={updateStatus.isPending}
                disabled={updateStatus.isPending}
              >
                {t('orders.complete')}
              </Button>
            )}
          </div>
        )}

        {/* Customer */}
        <div className="rounded-xl border px-5 py-4 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <User className="size-4 text-muted-foreground" />
            <p className="text-sm font-semibold">{t('orders.customer')}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>{t('fields.fullName')}</Label>
              <p className="text-sm font-medium">
                {user ? `${user.name ?? ''} ${user.surname ?? ''}`.trim() || '—' : '—'}
              </p>
            </div>
            <div className="space-y-1">
              <Label>{t('fields.phone')}</Label>
              <p className="text-sm tabular-nums">{user?.phone ?? '—'}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="rounded-xl border px-5 py-4 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Package className="size-4 text-muted-foreground" />
            <p className="text-sm font-semibold">{t('orders.itemsTitle')}</p>
          </div>
          <div className="divide-y">
            {order.items.map((item) => {
              const name = getTranslationName(item.product.translations, i18n.language) ?? '—'
              const image = item.product.images?.[0]
              return (
                <div key={item.id} className="flex items-center gap-3 py-3">
                  <div className="size-14 shrink-0 overflow-hidden rounded-lg border bg-muted flex items-center justify-center">
                    {image ? (
                      <img
                        src={buildFileUrl(image)}
                        alt={name}
                        className="size-full object-contain"
                      />
                    ) : (
                      <Package className="size-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">{name}</p>
                    <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
                      {parseFloat(item.price_at_order).toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums shrink-0">
                    {(parseFloat(item.price_at_order) * item.quantity).toFixed(2)}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="border-t pt-3 space-y-1">
            {order.has_rejected_shops && (
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">{t('orders.total')}</p>
                <p className="text-sm text-muted-foreground line-through tabular-nums">
                  {parseFloat(order.total).toFixed(2)}
                </p>
              </div>
            )}
            {order.delivery_price && (
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">{t('orders.deliveryPrice')}</p>
                <p className="text-sm text-muted-foreground tabular-nums">
                  {parseFloat(order.delivery_price).toFixed(2)}
                </p>
              </div>
            )}
            <div className="flex justify-between items-center">
              <p className="text-sm font-bold">{t('orders.grandTotal')}</p>
              <p className="text-sm font-bold tabular-nums">
                {parseFloat(order.effective_total).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Shops */}
        {order.order_shops && order.order_shops.length > 0 && (
          <div className="rounded-xl border px-5 py-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Store className="size-4 text-muted-foreground" />
              <p className="text-sm font-semibold">{t('orders.shopsTitle')}</p>
            </div>
            <div className="divide-y">
              {order.order_shops.map((orderShop) => (
                <div key={orderShop.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {orderShop.shop.additional?.name ?? `#${orderShop.shop_base_id}`}
                    </p>
                    <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
                      {orderShop.items.length} {t('orders.items')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={statusBadgeVariant[orderShop.status]}>
                      {t(`orders.statusLabel.${orderShop.status}`)}
                    </Badge>
                    <p className="text-sm font-semibold tabular-nums w-20 text-right">
                      {parseFloat(orderShop.subtotal).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Info */}
        <div className="grid grid-cols-2 gap-4 rounded-xl border px-5 py-4">
          <div className="space-y-1">
            <Label>{t('orders.paymentType')}</Label>
            <p className="text-sm font-medium">
              {t(paymentTypeKey[order.payment_type] ?? 'orders.payment.cash')}
            </p>
          </div>

          {order.pickup_point && (
            <div className="space-y-1">
              <Label>{t('orders.pickupPoint')}</Label>
              <p className="text-sm font-medium">
                {order.pickup_point.name}
                {order.pickup_point.address ? `, ${order.pickup_point.address}` : ''}
              </p>
            </div>
          )}

          {order.delivery_address && (
            <div className="space-y-1">
              <Label>{t('orders.deliveryAddress')}</Label>
              <p className="text-sm font-medium">{order.delivery_address}</p>
            </div>
          )}

          {order.delivery_price && (
            <div className="space-y-1">
              <Label>{t('orders.deliveryPrice')}</Label>
              <p className="text-sm font-medium tabular-nums">
                {parseFloat(order.delivery_price).toFixed(2)}
              </p>
            </div>
          )}

          {order.comment && (
            <div className="space-y-1 col-span-2">
              <Label>{t('orders.comment')}</Label>
              <p className="text-sm font-medium">{order.comment}</p>
            </div>
          )}

          <div className="space-y-1">
            <Label>{t('fields.createdAt')}</Label>
            <p className="text-sm tabular-nums">{formatDate(order.created_at)}</p>
          </div>

          {order.updated_at && (
            <div className="space-y-1">
              <Label>{t('orders.updatedAt')}</Label>
              <p className="text-sm tabular-nums">{formatDate(order.updated_at)}</p>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={askReject}
        onOpenChange={setAskReject}
        title={t('confirm.rejectOrderTitle')}
        description={t('confirm.rejectOrderText')}
        confirmLabel={t('orders.reject')}
        destructive
        busy={updateStatus.isPending}
        onConfirm={() => handleStatusUpdate(OrderStatusCode.REJECTED)}
      />
    </>
  )
}

function ApproveWithDeliveryPriceForm({
  isPending,
  onApprove,
  onReject,
  t,
}: {
  isPending: boolean
  onApprove: (deliveryPrice: string | null) => void
  onReject: () => void
  t: (key: string) => string
}) {
  const form = useForm({
    defaultValues: {
      delivery_price: '',
    },
    onSubmit: ({ value }) => {
      onApprove(value.delivery_price.trim())
    },
  })

  return (
    // items-end равняет кнопки по нижнему краю поля, а не по метке над ним:
    // иначе «Отклонить» встаёт вровень с меткой, а «Принять» — строкой ниже.
    // Подпись и ошибка уходят на свою строку через w-full.
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
      className="flex flex-wrap items-end gap-x-3 gap-y-1.5"
    >
      {/* Цена доставки обязательна: сервер отказывает в приёме заказа с адресом
        доставки без неё. Поле было безымянным плейсхолдером без проверки, и
        пустая отправка уходила на сервер за ответом 400 на чужом языке. */}
      <form.Field
        name="delivery_price"
        validators={{
          onSubmit: ({ value }) => {
            const raw = value.trim()
            if (!raw) return t('orders.deliveryPriceRequired')
            const price = Number(raw)
            if (!Number.isFinite(price) || price < 0) return t('orders.deliveryPriceInvalid')
            return undefined
          },
        }}
      >
        {(field) => (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="delivery_price">
                {t('orders.deliveryPrice')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="delivery_price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-40"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </div>

            <Button type="submit" variant="default" isLoading={isPending} disabled={isPending}>
              {t('orders.approve')}
            </Button>
            {/* Отклонение заказа делалось одним кликом без вопроса, при том
              что покупатель сразу видит отказ. */}
            <Button
              type="button"
              variant="destructive"
              onClick={onReject}
              isLoading={isPending}
              disabled={isPending}
            >
              {t('orders.reject')}
            </Button>

            {field.state.meta.errors.length > 0 ? (
              <p className="text-destructive w-full text-xs">{field.state.meta.errors[0]}</p>
            ) : (
              <p className="text-muted-foreground w-full text-xs">
                {t('orders.deliveryPriceHint')}
              </p>
            )}
          </>
        )}
      </form.Field>
    </form>
  )
}
