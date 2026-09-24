import { Loader2, Package, ShoppingCart, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import {
  useClientsStatisticsQuery,
  useOrdersStatisticsQuery,
  useShopsStatisticsQuery,
} from '../model/useStatisticsQueries'
import { Badge } from '@/shared/ui/badge'

function StatCard({
  icon,
  title,
  total,
  isLoading,
  children,
}: {
  icon: ReactNode
  title: string
  total: number
  isLoading: boolean
  children?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex flex-row gap-3 items-center text-muted-foreground">
        {icon}
        <p className="text-sm font-medium">{title}</p>
      </div>
      {isLoading ? (
        <Loader2 className="mt-3 size-5 animate-spin text-muted-foreground" />
      ) : (
        <>
          <p className="mt-2 text-3xl font-bold tabular-nums">{total}</p>
          {children && <div className="mt-4 space-y-2">{children}</div>}
        </>
      )}
    </div>
  )
}

function StatusRow({
  label,
  count,
  variant,
}: {
  label: string
  count: number
  variant: 'success' | 'warning' | 'destructive' | 'default' | 'info'
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <Badge variant={variant}>{label}</Badge>
      <span className="tabular-nums font-medium">{count}</span>
    </div>
  )
}

export function HomePage() {
  const { t } = useTranslation()

  const { data: shopsData, isLoading: shopsLoading } = useShopsStatisticsQuery()
  const { data: clientsData, isLoading: clientsLoading } = useClientsStatisticsQuery()
  const { data: ordersData, isLoading: ordersLoading } = useOrdersStatisticsQuery()

  const shops = shopsData?.data
  const clients = clientsData?.data
  const orders = ordersData?.data

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<Package className="size-4" />}
          title={t('dashboard.shopsTitle')}
          total={shops?.total ?? 0}
          isLoading={shopsLoading}
        >
          {shops?.by_status.map((item) => (
            <StatusRow
              key={item.status}
              label={t(`registrationStatus.${item.status}`)}
              count={item.count}
              variant={
                item.status === 'approved'
                  ? 'success'
                  : item.status === 'pending'
                    ? 'warning'
                    : item.status === 'rejected'
                      ? 'destructive'
                      : 'default'
              }
            />
          ))}
        </StatCard>

        <StatCard
          icon={<Users className="size-4" />}
          title={t('dashboard.clientsTitle')}
          total={clients?.total ?? 0}
          isLoading={clientsLoading}
        >
          <p className="text-sm text-muted-foreground">{t('dashboard.registeredClients')}</p>
        </StatCard>

        <StatCard
          icon={<ShoppingCart className="size-4" />}
          title={t('dashboard.ordersTitle')}
          total={orders?.total ?? 0}
          isLoading={ordersLoading}
        >
          {orders?.by_status.map((item) => (
            <StatusRow
              key={item.status}
              label={t(`orders.statusLabel.${item.status}`)}
              count={item.count}
              variant={
                item.status === 'completed'
                  ? 'success'
                  : item.status === 'pending'
                    ? 'warning'
                    : item.status === 'rejected'
                      ? 'destructive'
                      : 'info'
              }
            />
          ))}
        </StatCard>
      </div>
    </div>
  )
}
