import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { ReviewModal } from './ui/ReviewModal'
import { ReturnModal } from './ui/ReturnModal'
import type { OrderResponse } from '#/shared/openapi/requests/types.gen'
import type { OrderStatus } from '#/widgets/OrderDetails'
import type { ReviewModalRef } from './ui/ReviewModal'
import type { ReturnModalRef } from './ui/ReturnModal'
import { ORDERS_PAGE_SIZE, REFERENCE_LIST_LIMIT } from '#/shared/constants/pagination'
import {
  useCancelOrderOrdersOrderIdCancelPost,
  useGetShopAdditionalsShopAdditionalsGet,
  useListOwnReturnsReturnsMyGet,
  useListOwnReviewsReviewsMyGet,
} from '#/shared/openapi/queries'
import { useGetMyOrdersOrdersMyGetKey } from '#/shared/openapi/queries/common'
import { OrderStatusCode, ReturnStatus } from '#/shared/openapi/requests/types.gen'
import { OrderCard } from '#/widgets/OrderCard'
import { OrderDetails } from '#/widgets/OrderDetails'
import { Button } from '#/shared/ui/Button'
import { cn } from '#/shared/utils/cn'
import { getImageUrl } from '#/shared/utils/getImageUrl'
import { getTranslatedName } from '#/shared/utils/getTranslatedName'
import { getMyOrdersOrdersMyGet } from '#/shared/openapi/requests'
import { Spinner } from '#/shared/ui/Spinner'
import { formatNumericDateTime, getZonedParts } from '#/shared/utils/formatDate'

// Отмену сервер разрешает до того, как заказ собран: «ожидает» и
// «подтверждён» (CUSTOMER_CANCELLABLE_STATUSES в app/routers/orders.py).
const CANCELLABLE: Array<OrderStatusCode> = [OrderStatusCode.PENDING, OrderStatusCode.APPROVED]

/**
 * Состояние заказа глазами покупателя.
 *
 * Отказ магазина записывается в его часть заказа (`order_shops.status`), а
 * общий `order_status` при этом не меняется — это два независимых поля, и
 * согласовывать их некому. Поэтому заказ, от которого магазин отказался,
 * показывался покупателю как «Подтверждён», да ещё и с активной кнопкой
 * «Отменить заказ»: человеку сообщали ровно обратное тому, что произошло.
 *
 * Сервер отдаёт готовые признаки `all_shops_rejected` и `has_rejected_shops`
 * (админка ими уже пользуется) — берём их и здесь, вместо того чтобы читать
 * только общий статус.
 */
const buyerStatusCode = (order: OrderResponse): OrderStatusCode =>
  order.all_shops_rejected ? OrderStatusCode.REJECTED : order.order_status.code

/** Часть магазинов отказалась, но не все: заказ живёт дальше в урезанном виде. */
const isPartiallyRejected = (order: OrderResponse) =>
  order.has_rejected_shops && !order.all_shops_rejected

/**
 * Подпись статуса заказа.
 *
 * Раньше три разных состояния — «подтверждён», «готов к выдаче» и «готов к
 * доставке» — показывались покупателю одним «Готовится». Переводы статусов
 * сервер отдавать умеет, но в базе они пустые, поэтому серверная подпись
 * берётся только если она есть, иначе своя по коду статуса.
 */
const statusMap: Record<OrderStatusCode, OrderStatus> = {
  [OrderStatusCode.PENDING]: 'pending',
  [OrderStatusCode.APPROVED]: 'in_progress',
  [OrderStatusCode.REJECTED]: 'cancelled',
  [OrderStatusCode.READY_TO_TAKE]: 'in_progress',
  [OrderStatusCode.READY_TO_DELIVER]: 'in_progress',
  [OrderStatusCode.COMPLETED]: 'done',
}

// Месяц заказа — по Ашхабаду, как и время в карточке: getMonth() брал часы
// того, кто рендерит, и заказ в полночь 1-го числа уезжал в прошлый месяц.
const groupByMonth = (orders: Array<OrderResponse>) => {
  const map = new Map<string, { monthKey: number; year: number; items: Array<OrderResponse> }>()
  for (const order of orders) {
    const parts = getZonedParts(order.created_at)
    const year = parts?.year ?? 0
    const month = parts?.month ?? 0
    const key = `${year}-${month}`
    if (!map.has(key)) {
      map.set(key, { monthKey: month, year, items: [] })
    }
    map.get(key)!.items.push(order)
  }
  return Array.from(map.values())
}

export const OrdersPage = () => {
  const { t, i18n } = useTranslation()

  const reviewModalRef = useRef<ReviewModalRef>(null)
  const returnModalRef = useRef<ReturnModalRef>(null)

  // Свои отзывы нужны, чтобы не предлагать оценить дважды: сервер второй отзыв
  // и не примет, но узнавать об этом отказом — плохо.
  const { data: ownReviews } = useListOwnReviewsReviewsMyGet()
  const reviewedProductIds = new Set((ownReviews ?? []).map((review) => review.product_id))

  // Свои заявки на возврат — чтобы не предлагать подать вторую по той же
  // покупке: сервер её и не примет, но узнавать об этом отказом плохо.
  const { data: ownReturns } = useListOwnReturnsReturnsMyGet()
  const returnByOrderItem = new Map(
    (ownReturns ?? []).map((request) => [request.order_item_id, request]),
  )

  /**
   * Действия над товаром завершённого заказа: оценить и вернуть.
   *
   * Только для завершённых: до завершения товар не получен — ни оценивать, ни
   * возвращать нечего. То же правило стоит на сервере для обоих методов.
   */
  const renderProductActions = (order: OrderResponse) => {
    if (order.order_status.code !== OrderStatusCode.COMPLETED) return undefined
    return (product: { id: number; productId: number; name: string; quantity: number }) => {
      const existingReturn = returnByOrderItem.get(product.id)

      return (
        <div className="flex flex-col items-end gap-1">
          {reviewedProductIds.has(product.productId) ? (
            <p className="t2 text-passive2">{t('reviews.alreadyRated')}</p>
          ) : (
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => reviewModalRef.current?.open(product.productId, product.name)}
            >
              {t('reviews.rate')}
            </Button>
          )}

          {/* Состояние заявки показываем вместо кнопки: подавать вторую по той
              же покупке нельзя, а отклонённую надо видеть вместе с причиной. */}
          {existingReturn ? (
            <div className="flex flex-col items-end">
              <p
                className={cn(
                  't2 font-medium',
                  existingReturn.status === ReturnStatus.REJECTED
                    ? 'text-failure'
                    : 'text-passive2',
                )}
              >
                {t(`returns.status.${existingReturn.status}`)}
              </p>
              {existingReturn.resolution_comment && (
                <p className="t2 max-w-50 text-right text-passive2">
                  {existingReturn.resolution_comment}
                </p>
              )}
            </div>
          ) : (
            <Button
              variant="tertiary"
              size="sm"
              className="text-failure"
              onClick={() =>
                returnModalRef.current?.open(product.id, product.name, product.quantity)
              }
            >
              {t('returns.action')}
            </Button>
          )}
        </div>
      )
    }
  }

  const statusLabel = (
    status: {
      code: OrderStatusCode
      translations: Array<{ language: string; name: string }>
    },
    // Подпись с сервера принадлежит общему статусу. Когда показываемый статус
    // от него отличается (все магазины отказались), серверная подпись соврала
    // бы — берём перевод по выведенному коду.
    effectiveCode: OrderStatusCode = status.code,
  ) =>
    effectiveCode === status.code
      ? getTranslatedName(status.translations, i18n.language) || t(`orders.status.${status.code}`)
      : t(`orders.status.${effectiveCode}`)
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Лимит был прошит сотней и кнопки «показать ещё» не было: заказ сто первый
  // становился недостижим. Подгружаем страницами.
  const loaderRef = useRef<HTMLDivElement>(null)
  const {
    data: orderPages,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: [useGetMyOrdersOrdersMyGetKey, 'paged'],
    queryFn: ({ pageParam = 0 }) =>
      getMyOrdersOrdersMyGet({
        query: { sort: 'newest', skip: pageParam, limit: ORDERS_PAGE_SIZE },
      }).then((res) => res.data ?? []),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < ORDERS_PAGE_SIZE ? undefined : allPages.length * ORDERS_PAGE_SIZE,
  })
  const orders = orderPages?.pages.flat() ?? []

  const handleObserver = useCallback(
    (entries: Array<IntersectionObserverEntry>) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage()
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  )

  useEffect(() => {
    const el = loaderRef.current
    if (!el) return
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [handleObserver])

  useEffect(() => {
    if (orders.length > 0 && selectedId === null) {
      setSelectedId(orders[0].id)
    }
  }, [orders, selectedId])

  const {
    mutate: cancelOrder,
    isPending: isCancelling,
    error: cancelMutationError,
  } = useCancelOrderOrdersOrderIdCancelPost(undefined, {
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [useGetMyOrdersOrdersMyGetKey] })
      // Раньше отмена проходила молча, и человек не понимал, случилось ли что-нибудь.
      toast.success(t('orders.detail.cancelSuccessTitle'), {
        description: t('orders.detail.cancelSuccessDescription'),
      })
    },
  })

  const cancelError = (() => {
    if (!cancelMutationError) return null
    const e = cancelMutationError as { detail?: string | Array<{ msg: string }> }
    if (typeof e.detail === 'string') return e.detail
    if (Array.isArray(e.detail) && e.detail.length > 0) return e.detail[0].msg
    return t('login.errors.general')
  })()

  const handleCancel = (orderId: number) => {
    cancelOrder({ path: { order_id: orderId } })
  }

  const { data: shopAdditionals = [] } = useGetShopAdditionalsShopAdditionalsGet({
    query: { limit: REFERENCE_LIST_LIMIT },
  })

  const shopMap = new Map(shopAdditionals.map((s) => [s.shop_base_id, s]))

  const grouped = groupByMonth(orders)
  const selectedOrder = orders.find((o) => o.id === selectedId) ?? null

  const buildStores = (order: OrderResponse) => {
    const storeMap = new Map<
      number,
      {
        id: number
        name: string
        logo?: string
        products: Array<{
          id: number
          productId: number
          name: string
          price: number
          quantity: number
          image?: string
        }>
      }
    >()
    for (const item of order.items) {
      const shopBaseId = item.product.shop_base_id
      const shop = shopMap.get(shopBaseId)
      if (!storeMap.has(shopBaseId)) {
        storeMap.set(shopBaseId, {
          id: shopBaseId,
          name: shop?.name ?? t('orders.detail.unnamedStore'),
          logo: getImageUrl(shop?.logo_path),
          products: [],
        })
      }
      const productName = item.product.translations[0]?.name ?? ''
      storeMap.get(shopBaseId)!.products.push({
        id: item.id,
        productId: item.product.id,
        name: productName,
        price: parseFloat(item.price_at_order),
        quantity: item.quantity,
        image: getImageUrl(item.product.images?.[0]),
      })
    }
    return Array.from(storeMap.values())
  }

  const calcSubtotal = (order: OrderResponse) =>
    order.items.reduce((sum, item) => sum + parseFloat(item.price_at_order) * item.quantity, 0)

  const getDeliveryPrice = (order: OrderResponse) =>
    order.delivery_price != null ? parseFloat(order.delivery_price) : null

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-base bg-white animate-pulse" />
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-passive2">
        <p className="p2 font-semibold">{t('orders.empty')}</p>
      </div>
    )
  }

  return (
    <>
      {/* На широком экране ряд занимает высоту экрана целиком, а каждая колонка
          прокручивается сама. Раньше страница прокручивалась целиком, поэтому
          при чтении подробностей заголовок месяца и список заказов уезжали
          вверх вместе с ней. */}
      {/* Отдельная прокрутка колонок убрана: панель подробностей росла в
          своих границах и прокручивалась сама, а прокручиваться должна
          страница. Высота ряда — по содержимому. */}
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6 lg:items-start">
        {/* Left - Order List */}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {grouped.map((group) => (
            <div key={`${group.year}-${group.monthKey}`} className="flex flex-col gap-3">
              {/* Месяц как подпись над группой: заказы за разные месяцы иначе
                  сливаются в один поток. Не sticky — заголовок в примере
                  просто стоит на месте. */}
              <p className="t1 font-medium text-passive2">
                {t(`orders.months.${group.monthKey}`)} {group.year}
              </p>
              {group.items.map((order) => (
                <OrderCard
                  key={order.id}
                  id={order.id}
                  price={calcSubtotal(order)}
                  date={formatNumericDateTime(order.created_at)}
                  status={statusMap[buyerStatusCode(order)]}
                  label={statusLabel(order.order_status, buyerStatusCode(order))}
                  isActive={selectedId === order.id}
                  onClick={() => {
                    setSelectedId(order.id)
                    setIsDrawerOpen(true)
                  }}
                />
              ))}
            </div>
          ))}

          {/* Подгрузка следующей страницы при прокрутке до конца списка. */}
          {/* Пока есть что грузить: пустая метка внизу добавляла списку
              полосу воздуха, которой неоткуда взяться. */}
          {hasNextPage && (
            <div ref={loaderRef} className="flex justify-center py-3">
              {isFetchingNextPage && <Spinner />}
            </div>
          )}
        </div>

        {/* Right - Order Details (desktop only) */}
        {selectedOrder && (
          <div className="hidden min-w-0 flex-1 lg:flex">
            <OrderDetails
              key={selectedOrder.id}
              id={selectedOrder.id}
              status={statusMap[buyerStatusCode(selectedOrder)]}
              statusLabel={statusLabel(selectedOrder.order_status, buyerStatusCode(selectedOrder))}
              canCancel={CANCELLABLE.includes(buyerStatusCode(selectedOrder))}
              partiallyRejected={isPartiallyRejected(selectedOrder)}
              stores={buildStores(selectedOrder)}
              subtotal={calcSubtotal(selectedOrder)}
              discount={0}
              total={calcSubtotal(selectedOrder) + (getDeliveryPrice(selectedOrder) ?? 0)}
              deliveryPrice={getDeliveryPrice(selectedOrder)}
              paymentType={selectedOrder.payment_type}
              deliveryAddress={selectedOrder.delivery_address}
              pickupPoint={selectedOrder.pickup_point}
              onCancel={() => handleCancel(selectedOrder.id)}
              isCancelling={isCancelling}
              cancelError={cancelError}
              renderProductAction={renderProductActions(selectedOrder)}
            />
          </div>
        )}
      </div>

      {/* Mobile/tablet drawer */}
      <AnimatePresence>
        {isDrawerOpen && selectedOrder && (
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-60 bg-black/40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsDrawerOpen(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isDrawerOpen && selectedOrder && (
          <motion.div
            key="drawer"
            className="fixed top-0 right-0 bottom-0 z-60 w-full max-w-md bg-white shadow-xl flex flex-col overflow-hidden lg:hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-stroke shrink-0">
              <span className="p3 font-semibold">
                {t('orders.orderNumber', { id: selectedOrder.id })}
              </span>
              <button onClick={() => setIsDrawerOpen(false)} className="text-passive2">
                <X size={22} />
              </button>
            </div>
            <div className="overflow-y-auto no-scrollbar flex-1 flex flex-col">
              <OrderDetails
                key={selectedOrder.id}
                id={selectedOrder.id}
                status={statusMap[buyerStatusCode(selectedOrder)]}
                statusLabel={statusLabel(
                  selectedOrder.order_status,
                  buyerStatusCode(selectedOrder),
                )}
                canCancel={CANCELLABLE.includes(buyerStatusCode(selectedOrder))}
                partiallyRejected={isPartiallyRejected(selectedOrder)}
                stores={buildStores(selectedOrder)}
                subtotal={calcSubtotal(selectedOrder)}
                discount={0}
                total={calcSubtotal(selectedOrder) + (getDeliveryPrice(selectedOrder) ?? 0)}
                deliveryPrice={getDeliveryPrice(selectedOrder)}
                paymentType={selectedOrder.payment_type}
                deliveryAddress={selectedOrder.delivery_address}
                pickupPoint={selectedOrder.pickup_point}
                onCancel={() => handleCancel(selectedOrder.id)}
                isCancelling={isCancelling}
                cancelError={cancelError}
                renderProductAction={renderProductActions(selectedOrder)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ReviewModal ref={reviewModalRef} />
      <ReturnModal ref={returnModalRef} />
    </>
  )
}
