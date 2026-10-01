import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from '@tanstack/react-router'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import { ClipboardList, X } from 'lucide-react'
import { StoreOrderDetails } from './ui/StoreOrderDetails'
import { getStatusColor, getStatusIcon, sellerOrderStatus } from './model/statusMeta'
import type { LocalOrderStatusCode, OrderResponse } from '#/shared/openapi/requests/types.gen'
import { EmptyState } from '#/shared/ui/EmptyState'
import { useUpdateShopOrderStatusOrdersOrderIdShopShopIdStatusPatch } from '#/shared/openapi/queries'
import {
  useGetShopAttentionCountOrdersShopShopIdAttentionCountGetKey,
  useGetShopOrdersOrdersShopShopIdGetKey,
} from '#/shared/openapi/queries/common'
import { OrderCard } from '#/widgets/OrderCard'
import { ORDERS_PAGE_SIZE } from '#/shared/constants/pagination'
import { getShopOrdersOrdersShopShopIdGet } from '#/shared/openapi/requests'
import { Spinner } from '#/shared/ui/Spinner'
import { formatNumericDateTime, getZonedParts } from '#/shared/utils/formatDate'

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
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { storeId } = useParams({ from: '/my-store/$storeId' })
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Тот же прошитый лимит сотней, что и в заказах покупателя.
  const loaderRef = useRef<HTMLDivElement>(null)
  const {
    data: orderPages,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: [useGetShopOrdersOrdersShopShopIdGetKey, storeId, 'paged'],
    queryFn: ({ pageParam = 0 }) =>
      getShopOrdersOrdersShopShopIdGet({
        path: { shop_id: Number(storeId) },
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
    mutate: updateStatus,
    isPending: isUpdating,
    error: updateMutationError,
  } = useUpdateShopOrderStatusOrdersOrderIdShopShopIdStatusPatch(undefined, {
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [useGetShopOrdersOrdersShopShopIdGetKey] })
      // Принятый или собранный заказ больше не ждёт продавца — счётчик в меню
      // должен уменьшиться сразу, а не через минуту.
      void queryClient.invalidateQueries({
        queryKey: [useGetShopAttentionCountOrdersShopShopIdAttentionCountGetKey],
      })
    },
  })

  const updateError = (() => {
    if (!updateMutationError) return null
    const e = updateMutationError as { detail?: string | Array<{ msg: string }> }
    if (typeof e.detail === 'string') return e.detail
    if (Array.isArray(e.detail) && e.detail.length > 0) return e.detail[0].msg
    return t('login.errors.general')
  })()

  const handleStatusUpdate = (orderId: number, status: LocalOrderStatusCode) => {
    updateStatus({
      path: { order_id: orderId, shop_id: Number(storeId) },
      body: { status_code: status },
    })
  }

  const calcSubtotal = (order: OrderResponse) =>
    order.items
      .filter((item) => item.product.shop_base_id === Number(storeId))
      .reduce((sum, item) => sum + parseFloat(item.price_at_order) * item.quantity, 0)

  const grouped = groupByMonth(orders)
  const selectedOrder = orders.find((o) => o.id === selectedId) ?? null

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
      <EmptyState
        variant="plain"
        icon={<ClipboardList size={44} strokeWidth={1.5} />}
        title={t('storeOrders.empty')}
      />
    )
  }

  return (
    <>
      {/* Отдельная прокрутка колонок убрана: панель подробностей росла в
          своих границах и прокручивалась сама, а прокручиваться должна
          страница. Высота ряда — по содержимому. */}
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6 lg:items-start">
        {/* Left - Order List */}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {grouped.map((group) => (
            <div key={`${group.year}-${group.monthKey}`} className="flex flex-col gap-3">
              <p className="t1 font-medium text-passive2">
                {t(`orders.months.${group.monthKey}`)} {group.year}
              </p>
              {group.items.map((order) => {
                // Та же подпись, что и в подробностях: раньше список показывал
                // часть магазина, и заказ, уже полученный покупателем, висел
                // здесь «Готов к выдаче».
                const { code: displayStatus, labelKey } = sellerOrderStatus(order, Number(storeId))
                const StatusIcon = getStatusIcon(displayStatus)
                return (
                  <OrderCard
                    key={order.id}
                    id={order.id}
                    price={calcSubtotal(order)}
                    date={formatNumericDateTime(order.created_at)}
                    icon={<StatusIcon size={20} />}
                    label={t(labelKey)}
                    colorClass={getStatusColor(displayStatus)}
                    isActive={selectedId === order.id}
                    onClick={() => {
                      setSelectedId(order.id)
                      setIsDrawerOpen(true)
                    }}
                  />
                )
              })}
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
            <StoreOrderDetails
              key={selectedOrder.id}
              order={selectedOrder}
              storeId={Number(storeId)}
              onStatusUpdate={handleStatusUpdate}
              isUpdating={isUpdating}
              updateError={updateError}
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
              <StoreOrderDetails
                key={selectedOrder.id}
                order={selectedOrder}
                storeId={Number(storeId)}
                onStatusUpdate={handleStatusUpdate}
                isUpdating={isUpdating}
                updateError={updateError}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
