import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { BarChart3, Package, Receipt, Store } from 'lucide-react'
import {
  RegistrationStatus,
  getShopTopProductsOrdersShopShopIdTopProductsGet,
  getShopWeeklyRevenueOrdersShopShopIdWeeklyRevenueGet,
} from '#/shared/openapi/requests'
import { useProfileStore } from '#/shared/stores/profileStore'
import { getImageUrl } from '#/shared/utils/getImageUrl'
import { getTranslatedName } from '#/shared/utils/getTranslatedName'

/**
 * Сводная аналитика по всем магазинам владельца.
 *
 * Панель магазина показывает выручку и топ товаров по одному магазину, и,
 * если магазинов несколько, сравнить их можно было только переключаясь между
 * кабинетами. Здесь те же данные собраны в одном месте: суммарные показатели,
 * разбивка по магазинам и общий топ товаров.
 */
export const ProfileAnalyticsPage = () => {
  const { t, i18n } = useTranslation()
  const profile = useProfileStore((s) => s.profile)
  const currency = t('dashboard.revenue.currency')

  // Берём все одобренные магазины, включая заблокированные: они всё равно
  // принадлежат владельцу и видны ему в выборе магазина. Отсекать их здесь
  // означало «у вас нет магазинов» при трёх заблокированных — что и вышло.
  const shops = useMemo(
    () =>
      profile?.shops?.filter((shop) => shop.registration_status === RegistrationStatus.APPROVED) ??
      [],
    [profile],
  )

  const revenueQueries = useQueries({
    queries: shops.map((shop) => ({
      queryKey: ['analytics', 'revenue', shop.id],
      queryFn: () =>
        getShopWeeklyRevenueOrdersShopShopIdWeeklyRevenueGet({
          path: { shop_id: shop.id },
        }).then((res) => res.data),
      staleTime: 60 * 1000,
    })),
  })

  const topQueries = useQueries({
    queries: shops.map((shop) => ({
      queryKey: ['analytics', 'top', shop.id],
      queryFn: () =>
        getShopTopProductsOrdersShopShopIdTopProductsGet({
          path: { shop_id: shop.id },
          query: { limit: 5 },
        }).then((res) => res.data ?? []),
      staleTime: 60 * 1000,
    })),
  })

  const isLoading = revenueQueries.some((q) => q.isLoading) || topQueries.some((q) => q.isLoading)

  const perShop = shops.map((shop, index) => ({
    id: shop.id,
    name: shop.name ?? t('orders.detail.unnamedStore'),
    revenue: Number(revenueQueries[index]?.data?.total_revenue ?? 0),
    orders: revenueQueries[index]?.data?.orders_count ?? 0,
  }))

  const totalRevenue = perShop.reduce((sum, shop) => sum + shop.revenue, 0)
  const totalOrders = perShop.reduce((sum, shop) => sum + shop.orders, 0)

  // Топ по всем магазинам сразу: один и тот же товар в двух магазинах не
  // встречается, поэтому достаточно сложить списки и отсортировать.
  const topProducts = topQueries
    .flatMap((query) => query.data ?? [])
    .sort((a, b) => Number(b.total_revenue) - Number(a.total_revenue))
    .slice(0, 8)

  const period = revenueQueries.find((q) => q.data)?.data

  if (shops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-base bg-white p-10 text-center shadow-base">
        <Store className="size-8 text-passive1" />
        <p className="p3 font-semibold">{t('analytics.noShops')}</p>
        <p className="t1 text-passive2">{t('analytics.noShopsHint')}</p>
      </div>
    )
  }

  const cards = [
    {
      icon: Receipt,
      label: t('analytics.totalRevenue'),
      value: `${totalRevenue.toFixed(2)} ${currency}`,
    },
    { icon: Package, label: t('analytics.totalOrders'), value: String(totalOrders) },
    { icon: Store, label: t('analytics.shopsCount'), value: String(shops.length) },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-base bg-white p-5 shadow-base">
        <p className="p2 font-semibold">{t('analytics.title')}</p>
        <p className="t1 mt-0.5 text-passive1">
          {period
            ? t('analytics.period', {
                from: formatDate(period.period_start),
                to: formatDate(period.period_end),
              })
            : t('analytics.subtitle')}
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {cards.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 rounded-base bg-gray2 p-4">
              <Icon className="mt-0.5 size-5 shrink-0 text-blue-main" />
              <div className="flex min-w-0 flex-col">
                <span className="t1 text-passive2">{label}</span>
                <span className="p3 font-semibold break-words">{isLoading ? '—' : value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-base bg-white p-5 shadow-base">
        <p className="p2 font-semibold">{t('analytics.byShop')}</p>
        <div className="mt-3 flex flex-col divide-y divide-stroke">
          {perShop.map((shop) => (
            <div key={shop.id} className="flex items-center justify-between gap-3 py-3">
              <p className="p3 min-w-0 flex-1 truncate font-medium">{shop.name}</p>
              <p className="t1 shrink-0 text-passive2">
                {t('analytics.ordersShort', { count: shop.orders })}
              </p>
              <p className="p3 shrink-0 font-semibold">
                {shop.revenue.toFixed(2)} {currency}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-base bg-white p-5 shadow-base">
        <p className="p2 font-semibold">{t('analytics.topProducts')}</p>

        {!isLoading && topProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-passive2">
            <BarChart3 size={28} />
            <p className="t1 font-medium">{t('dashboard.revenue.empty')}</p>
          </div>
        )}

        <div className="mt-3 flex flex-col divide-y divide-stroke">
          {topProducts.map((item) => (
            <div key={item.product.id} className="flex items-center gap-3 py-3">
              <img
                src={getImageUrl(item.product.images?.[0])}
                alt=""
                className="size-10 shrink-0 rounded-lg object-cover"
              />
              <p className="p3 min-w-0 flex-1 truncate">
                {getTranslatedName(item.product.translations, i18n.language)}
              </p>
              <p className="t1 shrink-0 text-passive2">
                {t('analytics.soldShort', { count: item.total_quantity })}
              </p>
              <p className="p3 shrink-0 font-semibold">
                {Number(item.total_revenue).toFixed(2)} {currency}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const formatDate = (iso: string) => {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
}
