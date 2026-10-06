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
import { ORDERS_PAGE_SIZE } from '#/shared/constants/pagination'
import {
  useCancelOrderOrdersOrderIdCancelPost,
  useListOwnReturnsReturnsMyGet,
  useListOwnReviewsReviewsMyGet,
} from '#/shared/openapi/queries'
import { useGetMyOrdersOrdersMyGetKey } from '#/shared/openapi/queries/common'
import {
  LocalOrderStatusCode,
  OrderStatusCode,
  ReturnStatus,
} from '#/shared/openapi/requests/types.gen'
import { OrderCard } from '#/widgets/OrderCard'
import { OrderDetails } from '#/widgets/OrderDetails'
import { Button } from '#/shared/ui/Button'
import { cn } from '#/shared/utils/cn'
import { getImageUrl } from '#/shared/utils/getImageUrl'
import { getMyOrdersOrdersMyGet } from '#/shared/openapi/requests'
import { Spinner } from '#/shared/ui/Spinner'
import { formatNumericDateTime, getZonedParts } from '#/shared/utils/formatDate'
import { orderStatusKey } from '#/shared/lib/orderStatus'

// Отмену сервер разрешает до того, как заказ собран: «ожидает» и
// «подтверждён» (CUSTOMER_CANCELLABLE_STATUSES в app/routers/orders.py).
const CANCELLABLE: Array<OrderStatusCode> = [OrderStatusCode.PENDING, OrderStatusCode.APPROVED]

// Префикс, которым сервер помечает отмену покупателем (CUSTOMER_CANCEL_MARKER
// в app/routers/orders.py).
const CUSTOMER_CANCEL_MARKER = 'Отменён покупателем'

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
 * Цвет и значок статуса заказа. Подпись — отдельно, см. orderStatusKey.
 *
 * Раньше три разных состояния — «подтверждён», «готов к выдаче» и «готов к
 * доставке» — показывались покупателю одним «Готовится».
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
    const returnClosed = order.return_until != null && new Date(order.return_until) < new Date()
    return (product: {
      id: number
      productId: number
      name: string
      quantity: number
      price: number
    }) => {
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
                {/* Одобренный возврат, товар по которому уже получен, —
                    закрыт. Раньше покупатель видел «одобрен» навсегда. */}
                {existingReturn.received_at
                  ? t('returns.status.received')
                  : t(`returns.status.${existingReturn.status}`)}
              </p>
              {existingReturn.resolution_comment && (
                <p className="t2 max-w-50 text-right text-passive2">
                  {existingReturn.resolution_comment}
                </p>
              )}
            </div>
          ) : returnClosed ? (
            // Срок возврата — 14 дней после завершения заказа. Сервер позднюю
            // заявку не примет, поэтому и кнопку не предлагаем.
            <p className="t2 text-passive2">{t('returns.periodOver')}</p>
          ) : (
            <Button
              variant="tertiary"
              size="sm"
              className="text-failure"
              onClick={() =>
                returnModalRef.current?.open(
                  product.id,
                  product.name,
                  product.quantity,
                  product.price,
                )
              }
            >
              {t('returns.action')}
            </Button>
          )}
        </div>
      )
    }
  }

  // Кнопка «Вернуть» стоит у каждого товара, но тестировщик её не нашёл: мелкая
  // красная надпись рядом с «Оценить» не читается как путь к возврату. Над
  // товарами завершённого заказа теперь прямо сказано, где она и что дальше.
  const itemsNotice = (order: OrderResponse) => {
    if (order.order_status.code !== OrderStatusCode.COMPLETED) return undefined
    if (order.return_until == null) return t('returns.hint')
    // Срок называем датой: «14 дней» без точки отсчёта ничего не говорит.
    return new Date(order.return_until) < new Date()
      ? undefined
      : t('returns.hintUntil', { date: formatNumericDateTime(order.return_until) })
  }

  // Подпись статуса — своя, по коду и способу получения. Раньше она бралась с
  // сервера, если там был перевод, а переводы в базе звучат языком оператора:
  // заказ с самовывозом показывался покупателю «Готов к доставке». Код
  // берётся выведенный (все магазины отказались — «Отклонён»), а не общий.
  const statusLabel = (order: OrderResponse) =>
    t(orderStatusKey(buyerStatusCode(order), order.delivery_method))
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
    // Статус меняет оператор, а страница держала старый: покупатель видел
    // «Принят» с кнопкой отмены у уже доставленного заказа.
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
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
    // Отказ — значит, статус на экране устарел: перечитываем, чтобы кнопка
    // отмены пропала.
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: [useGetMyOrdersOrdersMyGetKey] })
    },
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
    const e = cancelMutationError as { status?: number; detail?: string | Array<{ msg: string }> }
    // 400 — заказ уже собран, в доставке или завершён: отменять поздно.
    // Раньше показывался английский текст сервера как есть.
    if (e.status === 400) return t('orders.detail.cancelTooLate')
    if (typeof e.detail === 'string') return e.detail
    if (Array.isArray(e.detail) && e.detail.length > 0) return e.detail[0].msg
    return t('login.errors.general')
  })()

  const handleCancel = (orderId: number, reason: string | null) => {
    cancelOrder({ path: { order_id: orderId }, body: { reason } })
  }

  const grouped = groupByMonth(orders)
  const selectedOrder = orders.find((o) => o.id === selectedId) ?? null

  // Название товара — на языке интерфейса: раньше бралась первая запись,
  // какой бы язык в ней ни был.
  const productName = (translations: Array<{ language: string; name: string }>) =>
    (translations.find((tr) => tr.language === i18n.language) ?? translations.at(0))?.name ?? ''

  /**
   * Магазины заказа — по его частям (`order_shops`), а не по товарам.
   *
   * Раньше магазины собирались из товаров, а название и логотип брались из
   * отдельного справочника с лимитом: магазин за его пределами или закрытый
   * показывался «без названия». И не было видно, какой магазин отказался и
   * почему, — данные для этого приходят в самой части заказа.
   */
  const buildStores = (order: OrderResponse) =>
    (order.order_shops ?? []).map((orderShop) => ({
      id: orderShop.shop_base_id,
      name: orderShop.shop.additional?.name ?? t('orders.detail.unnamedStore'),
      logo: getImageUrl(orderShop.shop.additional?.logo_path),
      rejected: orderShop.status === LocalOrderStatusCode.REJECTED,
      rejectReason: orderShop.comment,
      products: orderShop.items.map((item) => ({
        id: item.id,
        productId: item.product.id,
        name: productName(item.product.translations),
        price: parseFloat(item.price_at_order),
        quantity: item.quantity,
        image: getImageUrl(item.product.images?.[0]),
      })),
    }))

  // Суммы считает сервер: `total` — все товары, `effective_total` — к оплате,
  // без отказавшихся магазинов и с доставкой. Раньше итог складывался здесь
  // из всех товаров, и при отказе магазина был больше настоящего.
  const goodsTotal = (order: OrderResponse) => parseFloat(order.total)
  const payTotal = (order: OrderResponse) => parseFloat(order.effective_total)

  const getDeliveryPrice = (order: OrderResponse) =>
    order.delivery_price != null ? parseFloat(order.delivery_price) : null

  const rejectedTotal = (order: OrderResponse) =>
    goodsTotal(order) - (payTotal(order) - (getDeliveryPrice(order) ?? 0))

  // Отметку «Отменён покупателем» показываем только при отказе платформы:
  // о своей отмене покупатель знает и так.
  const statusComment = (order: OrderResponse) =>
    order.status_comment && !order.status_comment.startsWith(CUSTOMER_CANCEL_MARKER)
      ? order.status_comment
      : null

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
                  price={payTotal(order)}
                  date={formatNumericDateTime(order.created_at)}
                  status={statusMap[buyerStatusCode(order)]}
                  label={statusLabel(order)}
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
              statusLabel={statusLabel(selectedOrder)}
              canCancel={CANCELLABLE.includes(buyerStatusCode(selectedOrder))}
              partiallyRejected={isPartiallyRejected(selectedOrder)}
              stores={buildStores(selectedOrder)}
              subtotal={goodsTotal(selectedOrder)}
              discount={0}
              rejectedTotal={rejectedTotal(selectedOrder)}
              total={payTotal(selectedOrder)}
              statusComment={statusComment(selectedOrder)}
              deliveryPrice={getDeliveryPrice(selectedOrder)}
              paymentType={selectedOrder.payment_type}
              deliveryAddress={selectedOrder.delivery_address}
              pickupPoint={selectedOrder.pickup_point}
              onCancel={(reason) => handleCancel(selectedOrder.id, reason)}
              isCancelling={isCancelling}
              cancelError={cancelError}
              renderProductAction={renderProductActions(selectedOrder)}
              itemsNotice={itemsNotice(selectedOrder)}
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
                statusLabel={statusLabel(selectedOrder)}
                canCancel={CANCELLABLE.includes(buyerStatusCode(selectedOrder))}
                partiallyRejected={isPartiallyRejected(selectedOrder)}
                stores={buildStores(selectedOrder)}
                subtotal={goodsTotal(selectedOrder)}
                discount={0}
                rejectedTotal={rejectedTotal(selectedOrder)}
                total={payTotal(selectedOrder)}
                statusComment={statusComment(selectedOrder)}
                deliveryPrice={getDeliveryPrice(selectedOrder)}
                paymentType={selectedOrder.payment_type}
                deliveryAddress={selectedOrder.delivery_address}
                pickupPoint={selectedOrder.pickup_point}
                onCancel={(reason) => handleCancel(selectedOrder.id, reason)}
                isCancelling={isCancelling}
                cancelError={cancelError}
                renderProductAction={renderProductActions(selectedOrder)}
                itemsNotice={itemsNotice(selectedOrder)}
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
