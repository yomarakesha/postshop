import { Loader2, MapPin, Search, ShoppingBag, Truck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useOrdersQuery } from '../model/useOrdersQuery'
import { useRowNavigation } from '@/shared/hooks/useRowNavigation'
import { formatDate } from '@/shared/lib/formatDate'
import { orderStatusBadgeVariant, orderStatusLabel } from '@/shared/lib/orderStatus'
import { PaymentType } from '@/shared/openapi/requests'
import { Badge } from '@/shared/ui/badge'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/shared/ui/input-group'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

const paymentTypeKey: Record<string, string> = {
  [PaymentType.CASH]: 'orders.payment.cash',
  [PaymentType.CARD]: 'orders.payment.card',
  [PaymentType.CASH_AND_CARD]: 'orders.payment.cashAndCard',
}

export function OrdersPage() {
  const { t } = useTranslation()
  const rowProps = useRowNavigation()
  const [search, setSearch] = useState('')

  const { data: ordersData, isLoading } = useOrdersQuery({ sort: 'newest', limit: 200 })

  const orders = useMemo(() => {
    const all = ordersData?.data ?? []
    const q = search.trim().toLowerCase()
    if (!q) return all
    return all.filter((o) => String(o.id).includes(q) || String(o.user_id).includes(q))
  }, [ordersData, search])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <InputGroup className="max-w-xs">
          <InputGroupAddon>
            <InputGroupText>
              <Search className="size-4 text-muted-foreground" />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            placeholder={t('orders.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
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
              <TableHead>{t('fields.createdAt')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
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
                  <TableCell className="tabular-nums text-muted-foreground">
                    {formatDate(order.created_at)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  {t('noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
