import { useState } from 'react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { BarChart3, TrendingDown, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParams } from '@tanstack/react-router'
import { useGetShopSummaryOrdersShopShopIdSummaryGet } from '#/shared/openapi/queries'
import { SummaryPeriod } from '#/shared/openapi/requests'
import { cn } from '#/shared/utils/cn'
import { EmptyState } from '#/shared/ui/EmptyState'
import { formatDate } from '#/shared/utils/formatDate'

const PERIODS = [SummaryPeriod.WEEK, SummaryPeriod.MONTH, SummaryPeriod.QUARTER] as const

/**
 * Изменение к предыдущему периоду в процентах.
 *
 * `null`, когда сравнивать не с чем: рост с нуля не «бесконечность», а просто
 * отсутствие базы, и показывать там любое число было бы враньём.
 */
const change = (current: number, previous: number): number | null => {
  if (previous === 0) return null
  return ((current - previous) / previous) * 100
}

interface StatProps {
  label: string
  value: string
  unit?: string
  delta: number | null
  /** У отказов рост — это плохо, поэтому цвет разницы переворачивается. */
  inverted?: boolean
}

const Stat = ({ label, value, unit, delta, inverted }: StatProps) => {
  const { t } = useTranslation()
  const isUp = delta !== null && delta > 0
  const isGood = inverted ? !isUp : isUp

  return (
    <div className="flex flex-col gap-1 rounded-base border border-stroke p-4">
      <p className="t1 text-passive2">{label}</p>
      <p className="p1 font-bold">
        {value}
        {unit && <span className="p3 ml-1 font-medium text-passive2">{unit}</span>}
      </p>
      {/* Число без базы сравнения ничего не значит: «выручка 5000» не говорит,
          хорошо это или плохо, пока рядом нет прошлого периода. */}
      {delta === null ? (
        <p className="t2 text-passive1">{t('dashboard.summary.noBase')}</p>
      ) : (
        <p
          className={cn(
            't2 flex items-center gap-1 font-medium',
            Math.abs(delta) < 0.5 ? 'text-passive2' : isGood ? 'text-success' : 'text-failure',
          )}
        >
          {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {delta > 0 ? '+' : ''}
          {delta.toFixed(0)}%
        </p>
      )}
    </div>
  )
}

/**
 * Сводка магазина за период.
 *
 * До этого показывалась только текущая неделя с понедельника: в понедельник
 * утром график был почти пустым, и это выглядело как поломка. Период теперь
 * выбирается, а рядом с каждым числом стоит изменение к предыдущему такому же
 * периоду — иначе по числу нельзя понять, хорошо всё или плохо.
 */
export const SummaryStats = () => {
  const { t, i18n } = useTranslation()
  const { storeId } = useParams({ from: '/my-store/$storeId' })
  const currency = t('dashboard.revenue.currency')
  const [period, setPeriod] = useState<SummaryPeriod>(SummaryPeriod.WEEK)

  const { data, isLoading } = useGetShopSummaryOrdersShopShopIdSummaryGet({
    path: { shop_id: Number(storeId) },
    query: { period },
  })

  const current = data?.current
  const previous = data?.previous
  const isEmpty = !isLoading && current?.orders_count === 0 && previous?.orders_count === 0

  // Точка графика — календарный день («2026-09-23»), а не момент: общий
  // форматтер показывает его как есть, без сдвига по часам того, кто рендерит.
  const chartData = (data?.points ?? []).map((point) => ({
    name: formatDate(point.date, i18n.language, { day: '2-digit', month: '2-digit' }),
    value: Number(point.total_revenue),
  }))
  const maxValue = Math.max(...chartData.map((d) => d.value), 0)
  const maxIndex = chartData.findIndex((d) => d.value === maxValue && d.value > 0)

  return (
    <div className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="p2 font-semibold">{t('dashboard.revenue.title')}</p>
          <p className="t1 mt-0.5 text-passive1">{t('dashboard.summary.subtitle')}</p>
        </div>
        <div className="flex gap-1 rounded-base bg-gray2 p-1">
          {PERIODS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setPeriod(value)}
              className={cn(
                't1 rounded-base px-3 py-1.5 font-medium transition-colors',
                period === value ? 'bg-white text-text shadow-base' : 'text-passive2',
              )}
            >
              {t(`dashboard.summary.period.${value}`)}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-base bg-gray2" />
          ))}
        </div>
      )}

      {isEmpty && (
        <EmptyState
          variant="plain"
          className="py-10"
          icon={<BarChart3 size={40} strokeWidth={1.5} />}
          title={t('dashboard.revenue.empty')}
        />
      )}

      {!isLoading && !isEmpty && current && previous && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat
              label={t('dashboard.summary.revenue')}
              value={Math.round(Number(current.total_revenue)).toLocaleString(i18n.language)}
              unit={currency}
              delta={change(Number(current.total_revenue), Number(previous.total_revenue))}
            />
            <Stat
              label={t('dashboard.summary.orders')}
              value={String(current.orders_count)}
              delta={change(current.orders_count, previous.orders_count)}
            />
            <Stat
              label={t('dashboard.summary.averageCheck')}
              value={Math.round(Number(current.average_check)).toLocaleString(i18n.language)}
              unit={currency}
              delta={change(Number(current.average_check), Number(previous.average_check))}
            />
            {/* Растущая доля отказов — сигнал, что цена, наличие или сроки не
                сходятся, и продавец теряет деньги, не понимая почему. */}
            <Stat
              label={t('dashboard.summary.rejected')}
              value={String(current.rejected_count)}
              unit={`· ${Number(current.rejected_share).toFixed(0)}%`}
              delta={change(current.rejected_count, previous.rejected_count)}
              inverted
            />
          </div>

          <div className="mt-5">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barCategoryGap="20%">
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={16}
                  tick={{ fontSize: 12, fill: '#98a2b3' }}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload, label }) => {
                    if (!active || payload.length === 0) return null
                    return (
                      <div className="rounded-lg border border-stroke bg-white px-3 py-1.5 shadow-base">
                        <p className="t2 text-passive2">{label}</p>
                        <p className="t1 font-semibold">
                          {payload[0].value} {currency}
                        </p>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={index === maxIndex ? '#0750d5' : '#dceaff'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
