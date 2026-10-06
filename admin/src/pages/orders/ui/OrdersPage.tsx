import { useQuery } from '@tanstack/react-query'
import { Loader2, MapPin, ShoppingBag, Truck } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useOrdersQuery } from '../model/useOrdersQuery'
import { useFeatures } from '@/shared/hooks/useFeatures'
import { readTotalCount, useListControls } from '@/shared/hooks/useListControls'
import { useRowNavigation } from '@/shared/hooks/useRowNavigation'
import { formatDate } from '@/shared/lib/formatDate'
import { orderStatusBadgeVariant, orderStatusLabel } from '@/shared/lib/orderStatus'
import {
  OrderStatusCode,
  PaymentType,
  getOrderStatusesOrderStatusesGet,
} from '@/shared/openapi/requests'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { ListToolbar } from '@/widgets/ListToolbar'
import { TablePagination } from '@/widgets/TablePagination'

/** Фильтр списка: статус заказа или «часть FBO ждёт склада Postshop». */
type Filter = 'all' | 'fbo' | 'unpaid' | OrderStatusCode

const STATUS_FILTERS: OrderStatusCode[] = [
  OrderStatusCode.PENDING,
  OrderStatusCode.APPROVED,
  OrderStatusCode.READY_TO_TAKE,
  OrderStatusCode.READY_TO_DELIVER,
  OrderStatusCode.COMPLETED,
  OrderStatusCode.REJECTED,
]

const paymentTypeKey: Record<string, string> = {
  [PaymentType.CASH]: 'orders.payment.cash',
  [PaymentType.CARD]: 'orders.payment.card',
  [PaymentType.CASH_AND_CARD]: 'orders.payment.cashAndCard',
}

export function OrdersPage() {
  const { t } = useTranslation()
  const rowProps = useRowNavigation()
  const { fboEnabled } = useFeatures()
  const { page, setPage, search, setSearch, pageSize, skip, limit } = useListControls()
  const [filter, setFilterValue] = useState<Filter>('all')
  const setFilter = (value: Filter) => {
    setFilterValue(value)
    setPage(1)
  }

  // Фильтр сервера — по id статуса, а на экране удобнее код.
  const { data: statusesData } = useQuery({
    queryKey: ['order-statuses'],
    queryFn: () => getOrderStatusesOrderStatusesGet({ throwOnError: true }),
    staleTime: Infinity,
  })
  const statusId =
    filter !== 'all' && filter !== 'fbo'
      ? statusesData?.data.find((s) => s.code === filter)?.id
      : undefined

  // Раньше грузились 200 последних заказов, и поиск шёл только по ним:
  // заказ №201 и старше найти было нельзя. Теперь поиск, фильтр и страницы —
  // на сервере.
  const { data: ordersData, isLoading } = useOrdersQuery({
    sort: 'newest',
    skip,
    limit,
    q: search.trim() || undefined,
    status_id: statusId,
    fbo_attention: filter === 'fbo' || undefined,
    // Неоплаченные — среди живых заказов: у отклонённых оплаты и не ждут.
    paid: filter === 'unpaid' ? false : undefined,
  })
  const orders = ordersData?.data ?? []
  const total = readTotalCount(ordersData?.response.headers, orders.length)

  const filters: Array<{ key: Filter; label: string }> = [
    { key: 'all', label: t('orders.filter.all') },
    ...STATUS_FILTERS.map((code) => ({ key: code, label: orderStatusLabel(t, code) })),
    ...(fboEnabled ? [{ key: 'fbo' as const, label: t('orders.filter.fbo') }] : []),
    { key: 'unpaid', label: t('orders.filter.unpaid') },
  ]

  return (
    <div className="space-y-6">
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder={t('orders.searchPlaceholder')}
      />

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <Button
            key={item.key}
            size="sm"
            variant={filter === item.key ? 'default' : 'outline'}
            onClick={() => setFilter(item.key)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead className="w-12">#</TableHead>
              <TableHead>{t('orders.userId')}</TableHead>
              <TableHead>{t('orders.status')}</TableHead>
              <TableHead>{t('orders.paymentType')}</TableHead>
              <TableHead>{t('orders.deliveryType')}</TableHead>
              <TableHead>{t('orders.items')}</TableHead>
              <TableHead className="text-right">{t('orders.grandTotal')}</TableHead>
              <TableHead>{t('orders.payment.title')}</TableHead>
              <TableHead>{t('fields.createdAt')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center">
                  <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id} {...rowProps(`/orders/${order.id}`)}>
                  <TableCell className="tabular-nums text-muted-foreground">{order.id}</TableCell>
                  <TableCell className="tabular-nums font-medium">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                        <ShoppingBag className="size-3.5 text-muted-foreground" />
                      </div>
                      {t('orders.userIdLabel', { id: order.user_id })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={orderStatusBadgeVariant[order.order_status.code]}>
                      {orderStatusLabel(t, order.order_status.code, order.delivery_method)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {t(paymentTypeKey[order.payment_type] ?? 'orders.payment.cash')}
                  </TableCell>
                  <TableCell>
                    {order.pickup_point ? (
                      <div className="flex items-center gap-1.5 text-sm">
                        <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="font-medium">{order.pickup_point.name}</span>
                      </div>
                    ) : order.delivery_address ? (
                      <div className="flex items-center gap-1.5 text-sm">
                        <Truck className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="text-muted-foreground truncate max-w-48">
                          {order.delivery_address}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {order.items.length}
                  </TableCell>
                  <TableCell className="tabular-nums text-right font-medium">
                    {parseFloat(order.effective_total).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {order.order_status.code !== OrderStatusCode.REJECTED && (
                      <Badge variant={order.paid_at ? 'success' : 'warning'}>
                        {order.paid_at ? t('orders.payment.paid') : t('orders.payment.unpaid')}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {formatDate(order.created_at)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                  {t('noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
    </div>
  )
}
