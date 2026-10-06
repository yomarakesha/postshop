import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { readTotalCount, useListControls } from '@/shared/hooks/useListControls'
import { useRowNavigation } from '@/shared/hooks/useRowNavigation'
import { formatDate } from '@/shared/lib/formatDate'
import { orderStatusBadgeVariant, orderStatusLabel } from '@/shared/lib/orderStatus'
import {
  OrderStatusCode,
  ReturnStatus,
  getShopOrdersOrdersShopShopIdGet,
  listShopReturnsReturnsShopShopIdGet,
} from '@/shared/openapi/requests'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { TablePagination } from '@/widgets/TablePagination'

type Tab = 'orders' | 'returns'

const returnVariant = {
  [ReturnStatus.PENDING]: 'warning',
  [ReturnStatus.APPROVED]: 'success',
  [ReturnStatus.REJECTED]: 'destructive',
} as const

/**
 * Заказы и возвраты магазина — в его карточке.
 *
 * Разбирая спор с продавцом, сотрудник не видел ни его заказов, ни возвратов:
 * искать приходилось по общим спискам, где магазина в фильтрах нет.
 */
export function StoreActivity({ shopId }: { shopId: number }) {
  const { t } = useTranslation()
  const rowProps = useRowNavigation()
  const [tab, setTab] = useState<Tab>('orders')
  const { page, setPage, pageSize, skip, limit } = useListControls()

  const ordersQuery = useQuery({
    queryKey: ['orders', 'shop', shopId, skip, limit],
    queryFn: () =>
      getShopOrdersOrdersShopShopIdGet({
        path: { shop_id: shopId },
        query: { skip, limit },
        throwOnError: true,
      }),
    enabled: tab === 'orders',
  })
  const returnsQuery = useQuery({
    queryKey: ['returns', 'shop', shopId, skip, limit],
    queryFn: () =>
      listShopReturnsReturnsShopShopIdGet({
        path: { shop_id: shopId },
        query: { skip, limit },
        throwOnError: true,
      }),
    enabled: tab === 'returns',
  })

  const active = tab === 'orders' ? ordersQuery : returnsQuery
  const rows = active.data?.data ?? []
  const total = readTotalCount(active.data?.response.headers, rows.length)

  const switchTab = (next: Tab) => {
    setTab(next)
    setPage(1)
  }

  return (
    <div className="space-y-3 rounded-xl border px-5 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Label className="text-base">{t('stores.activity')}</Label>
        <div className="flex gap-2">
          {(['orders', 'returns'] as const).map((item) => (
            <Button
              key={item}
              size="sm"
              variant={tab === item ? 'default' : 'outline'}
              onClick={() => switchTab(item)}
            >
              {t(`stores.activityTab.${item}`)}
            </Button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border">
        {active.isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : tab === 'orders' ? (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">#</TableHead>
                <TableHead>{t('orders.status')}</TableHead>
                <TableHead className="text-right">{t('stores.partTotal')}</TableHead>
                <TableHead>{t('orders.payment.title')}</TableHead>
                <TableHead>{t('fields.createdAt')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(ordersQuery.data?.data ?? []).map((order) => {
                // Ответ уже обрезан до этого магазина: его часть — единственная.
                const part = order.order_shops?.[0]
                return (
                  <TableRow key={order.id} {...rowProps(`/orders/${order.id}`)}>
                    <TableCell className="tabular-nums text-muted-foreground">{order.id}</TableCell>
                    <TableCell>
                      <Badge variant={orderStatusBadgeVariant[order.order_status.code]}>
                        {orderStatusLabel(t, order.order_status.code, order.delivery_method)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {part ? parseFloat(part.subtotal).toFixed(2) : '—'}
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
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">ID</TableHead>
                <TableHead>{t('returnRequests.product')}</TableHead>
                <TableHead>{t('returnRequests.quantity')}</TableHead>
                <TableHead className="text-right">{t('returnRequests.amount')}</TableHead>
                <TableHead>{t('fields.status')}</TableHead>
                <TableHead>{t('fields.createdAt')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(returnsQuery.data?.data ?? []).map((request) => (
                <TableRow
                  key={request.id}
                  {...(request.order_id ? rowProps(`/orders/${request.order_id}`) : {})}
                >
                  <TableCell className="tabular-nums text-muted-foreground">{request.id}</TableCell>
                  <TableCell>{request.product_name ?? `#${request.product_id ?? ''}`}</TableCell>
                  <TableCell className="tabular-nums">{request.quantity}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {request.amount != null ? parseFloat(request.amount).toFixed(2) : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={returnVariant[request.status]}>
                      {t(`returnStatus.${request.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {request.created_at ? formatDate(request.created_at) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!active.isLoading && rows.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">{t('noResults')}</p>
        )}
      </div>

      <TablePagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
    </div>
  )
}
