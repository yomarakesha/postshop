import React, { useState } from 'react'
import { Pressable, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { TFunction } from 'i18next'
import { orderApi } from '@/api/orderApi'
import ActivityIndicator from '@/ui/ActivityIndicator'
import Typography from '@/ui/Typography'
import { formatAmount, getCurrencyCode } from '@/utils/formatMoney'
import { formatApiDate } from '@/utils/formatDate'

const PERIODS: Order.API.SummaryPeriod[] = ['week', 'month', 'quarter']

/** Высота столбцов графика; самый большой день занимает её целиком. */
const CHART_HEIGHT = 120

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

type StatProps = {
  label: string
  value: string
  unit?: string
  delta: number | null
  /** У отказов рост — это плохо, поэтому цвет разницы переворачивается. */
  inverted?: boolean
  t: TFunction
}

const Stat = ({ label, value, unit, delta, inverted, t }: StatProps) => {
  const isUp = delta !== null && delta > 0
  const isGood = inverted ? !isUp : isUp

  return (
    <View style={styles.stat}>
      <Typography variant="t1" color="secondary">
        {label}
      </Typography>
      <Typography variant="p2" weight="bold" numberOfLines={1}>
        {value}
        {!!unit && (
          <Typography variant="t1" weight="medium" color="secondary">
            {` ${unit}`}
          </Typography>
        )}
      </Typography>
      {/* Число без базы сравнения ничего не значит: «выручка 5000» не
          говорит, хорошо это или плохо, пока рядом нет прошлого периода. */}
      {delta === null ? (
        <Typography variant="t2" color="tertiary">
          {t('store.home.summary.noBase')}
        </Typography>
      ) : (
        <Typography
          variant="t2"
          weight="medium"
          color={Math.abs(delta) < 0.5 ? 'secondary' : isGood ? 'success' : 'error'}
        >
          {`${isUp ? '▲' : '▼'} ${delta > 0 ? '+' : ''}${delta.toFixed(0)}%`}
        </Typography>
      )}
    </View>
  )
}

type Props = {
  shopBaseId?: number
  t: TFunction
  language?: string | null
}

/**
 * Сводка магазина за период — как на витрине
 * (`pages/my-store-dashboard/ui/SummaryStats`).
 *
 * Прежний виджет показывал только текущую неделю с понедельника: в понедельник
 * утром там был ноль, и это выглядело как поломка. Теперь период выбирается,
 * а рядом с каждым числом стоит изменение к предыдущему такому же периоду.
 */
const SummaryWidget = ({ shopBaseId, t, language }: Props) => {
  const [period, setPeriod] = useState<Order.API.SummaryPeriod>('week')
  const { data, isLoading } = orderApi.useGetSummary(shopBaseId!, period, !!shopBaseId)
  const currency = getCurrencyCode()

  const current = data?.current
  const previous = data?.previous
  // Пусто — только когда нет ни продаж, ни отказов: магазин, который пока
  // только отказывает, как раз должен увидеть свои отказы.
  const isEmpty =
    !isLoading &&
    !!current &&
    !!previous &&
    current.orders_count + current.rejected_count === 0 &&
    previous.orders_count + previous.rejected_count === 0

  // point.date — календарный день ("YYYY-MM-DD"). `new Date(...)` делал из
  // него полночь UTC, и на телефоне с поясом западнее UTC подпись уезжала
  // на предыдущий день; formatApiDate показывает дату как есть.
  const points = (data?.points ?? []).map((point) => ({
    label: formatApiDate(point.date, language, {
      day: '2-digit',
      month: '2-digit',
    }),
    value: Number(point.total_revenue),
  }))
  const maxValue = Math.max(...points.map((p) => p.value), 0)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Typography variant="p2" weight="semiBold">
          {t('store.home.incomeReport.title')}
        </Typography>
        <Typography variant="t1" color="secondary">
          {t('store.home.summary.subtitle')}
        </Typography>
      </View>

      <View style={styles.periods}>
        {PERIODS.map((value) => (
          <Pressable
            key={value}
            onPress={() => setPeriod(value)}
            style={styles.period(period === value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: period === value }}
          >
            <Typography
              variant="t1"
              weight="medium"
              isCentered
              color={period === value ? undefined : 'secondary'}
            >
              {t(`store.home.summary.period.${value}`)}
            </Typography>
          </Pressable>
        ))}
      </View>

      {isLoading && (
        <View style={styles.loader}>
          <ActivityIndicator />
        </View>
      )}

      {isEmpty && (
        <Typography variant="t1" color="tertiary">
          {t('store.home.summary.empty')}
        </Typography>
      )}

      {!isLoading && !isEmpty && current && previous && (
        <>
          <View style={styles.grid}>
            <Stat
              label={t('store.home.summary.revenue')}
              value={formatAmount(Math.round(Number(current.total_revenue)), 0)}
              unit={currency}
              delta={change(Number(current.total_revenue), Number(previous.total_revenue))}
              t={t}
            />
            <Stat
              label={t('store.home.summary.orders')}
              value={String(current.orders_count)}
              delta={change(current.orders_count, previous.orders_count)}
              t={t}
            />
            <Stat
              label={t('store.home.summary.averageCheck')}
              value={formatAmount(Math.round(Number(current.average_check)), 0)}
              unit={currency}
              delta={change(Number(current.average_check), Number(previous.average_check))}
              t={t}
            />
            {/* Растущая доля отказов — сигнал, что цена, наличие или сроки
                не сходятся, и продавец теряет деньги, не понимая почему. */}
            <Stat
              label={t('store.home.summary.rejected')}
              value={String(current.rejected_count)}
              unit={`· ${Number(current.rejected_share).toFixed(0)}%`}
              delta={change(current.rejected_count, previous.rejected_count)}
              inverted
              t={t}
            />
          </View>

          {points.length > 0 && (
            <View>
              <View style={styles.chart}>
                {points.map((point, index) => (
                  <View key={index} style={styles.barSlot}>
                    <View
                      style={styles.bar(
                        maxValue > 0 ? point.value / maxValue : 0,
                        point.value > 0 && point.value === maxValue,
                      )}
                    />
                  </View>
                ))}
              </View>
              {/* Подписи только у краёв: на месяце 30 дат в ряд не
                  помещаются и сливаются в кашу. */}
              <View style={styles.axis}>
                <Typography variant="t2" color="tertiary">
                  {points[0].label}
                </Typography>
                <Typography variant="t2" color="tertiary">
                  {points[points.length - 1].label}
                </Typography>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  )
}

export default SummaryWidget

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing(3),
    padding: theme.spacing(4),
    gap: theme.spacing(3),
    ...theme.shadows.hard,
  },
  header: {
    gap: theme.spacing(1),
  },
  periods: {
    flexDirection: 'row',
    gap: theme.spacing(1),
    padding: theme.spacing(1),
    borderRadius: theme.radius.base,
    backgroundColor: theme.colors.gray2,
  },
  period: (isActive: boolean) => ({
    flex: 1,
    paddingVertical: theme.spacing(1.5),
    borderRadius: theme.radius.base,
    backgroundColor: isActive ? theme.colors.white : 'transparent',
  }),
  loader: {
    paddingVertical: theme.spacing(3),
    alignItems: 'flex-start',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
  },
  stat: {
    // Две карточки в ряд: половина ширины минус половина зазора.
    flexBasis: '48%',
    flexGrow: 1,
    gap: theme.spacing(0.5),
    padding: theme.spacing(3),
    borderRadius: theme.radius.base,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: CHART_HEIGHT,
    gap: theme.spacing(0.5),
  },
  barSlot: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: (share: number, isMax: boolean) => ({
    // Нулевой день — тонкая полоска, а не пустое место: видно, что продаж
    // не было, а не что день пропал с оси.
    height: Math.max(share * CHART_HEIGHT, 2),
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    backgroundColor: isMax ? theme.colors.blueMain : theme.colors.blue2,
  }),
  axis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing(1),
  },
}))
