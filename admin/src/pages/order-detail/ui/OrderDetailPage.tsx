import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Package, Store, User } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { useOrderQuery } from '../model/useOrderQuery'
import { useUpdateOrderStatusMutation } from '../model/useUpdateOrderStatusMutation'
import { useUpdateShopPartStatusMutation } from '../model/useUpdateShopPartStatusMutation'
import { PERMISSION_KEYS } from '@/shared/constants/PermissionKeys'
import { useHasPermission } from '@/shared/hooks/useHasPermission'
import { buildFileUrl } from '@/shared/lib/buildFileUrl'
import { formatDate } from '@/shared/lib/formatDate'
import { getTranslationName } from '@/shared/lib/getTranslationName'
import {
  orderActionLabel,
  orderStatusBadgeVariant as statusBadgeVariant,
  orderStatusLabel,
} from '@/shared/lib/orderStatus'
import {
  LocalOrderStatusCode,
  OrderStatusCode,
  PaymentType,
  WarehouseType,
  getUserUsersUserIdGet,
} from '@/shared/openapi/requests'
import type { OrderShopResponse } from '@/shared/openapi/requests'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { WarehouseTypeBadge } from '@/widgets/WarehouseTypeBadge'

/**
 * Куда можно перевести часть заказа из её текущего статуса — те же правила,
 * что на сервере: pending → approved/rejected, approved → ready_to_take/rejected.
 * Кнопки недопустимых переходов не показываются, а не отвечают 400.
 */
const PART_TRANSITIONS: Partial<Record<LocalOrderStatusCode, LocalOrderStatusCode[]>> = {
  [LocalOrderStatusCode.PENDING]: [LocalOrderStatusCode.APPROVED, LocalOrderStatusCode.REJECTED],
  [LocalOrderStatusCode.APPROVED]: [
    LocalOrderStatusCode.READY_TO_TAKE,
    LocalOrderStatusCode.REJECTED,
  ],
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
  const updatePartStatus = useUpdateShopPartStatusMutation(orderId)
  const { hasPermission } = useHasPermission()
  const [askReject, setAskReject] = useState(false)
  const [rejectPart, setRejectPart] = useState<OrderShopResponse | null>(null)
  const [rejectPartComment, setRejectPartComment] = useState('')

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

  // Способ получения считает сервер (delivery_method): по нему же выбираются
  // подписи статусов и кнопок — у самовывоза «Готов к доставке» был бессмыслицей.
  const deliveryMethod = order.delivery_method
  const isDeliveryOrder = deliveryMethod === 'delivery'

  // onError здесь был лишним: MutationCache подавляет глобальный тост только
  // если onError объявлен в опциях самой мутации, а переданный в mutate()
  // живёт отдельно — на каждую ошибку показывались два тоста подряд.
  const handleStatusUpdate = (status: OrderStatusCode, deliveryPrice?: string | null) => {
    updateStatus.mutate({ statusCode: status, deliveryPrice })
  }

  // Часть FBO собирает склад Postshop, и её статус ведёт сотрудник; часть FBS
  // — продавец, здесь она только для просмотра. Сервер принимает смену
  // статуса части лишь пока весь заказ «Одобрен».
  const canFulfilParts =
    statusCode === OrderStatusCode.APPROVED &&
    hasPermission(PERMISSION_KEYS.ORDERS.updateShopStatus)
  const partActions = (orderShop: OrderShopResponse) =>
    orderShop.warehouse_type === WarehouseType.FBO && canFulfilParts
      ? (PART_TRANSITIONS[orderShop.status] ?? [])
      : []
  const isPartBusy = (orderShop: OrderShopResponse) =>
    updatePartStatus.isPending && updatePartStatus.variables?.shopId === orderShop.shop_base_id

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
            {orderStatusLabel(t, statusCode, deliveryMethod)}
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
                    {orderActionLabel(t, OrderStatusCode.READY_TO_TAKE)}
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
                {orderActionLabel(t, OrderStatusCode.READY_TO_DELIVER, deliveryMethod)}
              </Button>
            )}

            {statusCode === OrderStatusCode.READY_TO_DELIVER && (
              <Button
                variant="default"
                onClick={() => handleStatusUpdate(OrderStatusCode.COMPLETED)}
                isLoading={updateStatus.isPending}
                disabled={updateStatus.isPending}
              >
                {orderActionLabel(t, OrderStatusCode.COMPLETED, deliveryMethod)}
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
              {order.order_shops.map((orderShop) => {
                const actions = partActions(orderShop)
                const busy = isPartBusy(orderShop)
                return (
                  <div key={orderShop.id} className="space-y-2 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="text-sm font-medium truncate">
                          {orderShop.shop.additional?.name ?? `#${orderShop.shop_base_id}`}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Кто собирает часть, видно не было: сотрудник не
                            знал, ждать продавца или собирать самому. */}
                          <WarehouseTypeBadge type={orderShop.warehouse_type} fulfilment />
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {orderShop.items.length} {t('orders.items')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant={statusBadgeVariant[orderShop.status]}>
                          {orderStatusLabel(t, orderShop.status)}
                        </Badge>
                        <p className="text-sm font-semibold tabular-nums w-20 text-right">
                          {parseFloat(orderShop.subtotal).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {orderShop.comment && (
                      <p className="text-xs text-muted-foreground whitespace-pre-line">
                        {t('orders.comment')}: {orderShop.comment}
                      </p>
                    )}

                    {actions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {actions.includes(LocalOrderStatusCode.APPROVED) && (
                          <Button
                            size="sm"
                            onClick={() =>
                              updatePartStatus.mutate({
                                shopId: orderShop.shop_base_id,
                                statusCode: LocalOrderStatusCode.APPROVED,
                              })
                            }
                            isLoading={busy}
                            disabled={updatePartStatus.isPending}
                          >
                            {t('orders.approve')}
                          </Button>
                        )}
                        {actions.includes(LocalOrderStatusCode.READY_TO_TAKE) && (
                          <Button
                            size="sm"
                            onClick={() =>
                              updatePartStatus.mutate({
                                shopId: orderShop.shop_base_id,
                                statusCode: LocalOrderStatusCode.READY_TO_TAKE,
                              })
                            }
                            isLoading={busy}
                            disabled={updatePartStatus.isPending}
                          >
                            {orderActionLabel(t, LocalOrderStatusCode.READY_TO_TAKE)}
                          </Button>
                        )}
                        {actions.includes(LocalOrderStatusCode.REJECTED) && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setRejectPartComment('')
                              setRejectPart(orderShop)
                            }}
                            disabled={updatePartStatus.isPending}
                          >
                            {t('orders.reject')}
                          </Button>
                        )}
                      </div>
                    )}

                    {orderShop.warehouse_type === WarehouseType.FBO &&
                      statusCode === OrderStatusCode.PENDING && (
                        <p className="text-xs text-muted-foreground">
                          {t('orders.fboPartWaitsApproval')}
                        </p>
                      )}
                  </div>
                )
              })}
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
      <ConfirmDialog
        open={rejectPart !== null}
        onOpenChange={(open) => !open && setRejectPart(null)}
        title={t('orders.rejectPartTitle', {
          shop: rejectPart?.shop.additional?.name ?? `#${rejectPart?.shop_base_id ?? ''}`,
        })}
        description={
          <div className="space-y-2">
            <p>{t('orders.rejectPartText')}</p>
            <Textarea
              value={rejectPartComment}
              onChange={(e) => setRejectPartComment(e.target.value)}
              placeholder={t('orders.rejectPartCommentPlaceholder')}
              rows={3}
            />
          </div>
        }
        confirmLabel={t('orders.reject')}
        destructive
        busy={updatePartStatus.isPending}
        onConfirm={() => {
          if (!rejectPart) return
          updatePartStatus.mutate({
            shopId: rejectPart.shop_base_id,
            statusCode: LocalOrderStatusCode.REJECTED,
            comment: rejectPartComment.trim() || null,
          })
        }}
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
