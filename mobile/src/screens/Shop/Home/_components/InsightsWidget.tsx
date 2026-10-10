import React from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { TFunction } from 'i18next'
import { orderApi } from '@/api/orderApi'
import Typography from '@/ui/Typography'
import { formatMoney } from '@/utils/formatMoney'
import { pickTranslatedName } from '@/utils/pickTranslation'

/** Больше десяти строк в списке никто не разбирает — остальное только шумит. */
const VISIBLE = 10

type Props = {
  shopBaseId?: number
  t: TFunction
  language?: string | null
}

/**
 * Списки, по которым продавцу есть что сделать, — как на витрине
 * (`pages/my-store-dashboard/ui/Insights`).
 *
 * Сводка отвечает на «как дела», этот блок — на «что чинить»: какие товары
 * смотрят и не покупают, какие возвращают, как магазин оценивают. Рейтинг
 * магазина считался и раньше, но продавцу в приложении не показывался.
 */
const InsightsWidget = ({ shopBaseId, t, language }: Props) => {
  const { data } = orderApi.useGetInsights(shopBaseId!, !!shopBaseId)

  if (!data) return null

  // Поля со значением по умолчанию на сервере в схеме необязательны —
  // подставляем то же самое, чтобы не разбирать undefined в разметке.
  const unsold = (data.unsold ?? []).slice(0, VISIBLE)
  const returned = (data.returned ?? []).slice(0, VISIBLE)
  const ratingCount = data.rating_count ?? 0
  const newReviews = data.new_reviews ?? 0

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Typography variant="p2" weight="semiBold">
          {t('store.home.insights.title')}
        </Typography>
        <Typography variant="t1" color="secondary">
          {t('store.home.insights.subtitle')}
        </Typography>
      </View>

      <View style={styles.rating}>
        {ratingCount > 0 ? (
          <View style={styles.ratingValue}>
            <Typography variant="p2" weight="bold" color="warning">
              ★
            </Typography>
            <Typography variant="p2" weight="bold">
              {Number(data.rating_avg ?? 0).toFixed(1)}
            </Typography>
            <Typography variant="t1" color="secondary">
              {t('store.home.insights.ratingCount', { count: ratingCount })}
            </Typography>
          </View>
        ) : (
          <Typography variant="t1" color="secondary">
            {t('store.home.insights.noRating')}
          </Typography>
        )}
        {newReviews > 0 && (
          <Typography variant="t1" color="secondary">
            {t('store.home.insights.newReviews', { count: newReviews })}
          </Typography>
        )}
      </View>

      {unsold.length > 0 && (
        <View>
          <Typography variant="p3" weight="medium">
            {t('store.home.insights.unsold')}
          </Typography>
          {/* Сортировка по просмотрам: товар, который смотрят и не покупают,
              — самый понятный повод поменять цену или фотографию. */}
          <Typography variant="t2" color="secondary">
            {t('store.home.insights.unsoldHint')}
          </Typography>
          {unsold.map((item, index) => (
            <View key={item.product_id} style={styles.row(index === 0)}>
              {/* Просмотры — под названием: в одной строке с ценой они
                  съедали половину ширины, и название обрезалось до слова. */}
              <View style={styles.name}>
                <Typography variant="t1" numberOfLines={1}>
                  {pickTranslatedName(item.translations, language)}
                </Typography>
                <Typography variant="t2" color="secondary">
                  {t('store.home.insights.views', { count: item.views_count })}
                </Typography>
              </View>
              <Typography variant="t1" weight="medium">
                {formatMoney(item.price)}
              </Typography>
            </View>
          ))}
        </View>
      )}

      {returned.length > 0 && (
        <View>
          <Typography variant="p3" weight="medium">
            {t('store.home.insights.returned')}
          </Typography>
          {/* Один возврат — случайность, три на один товар — брак партии. */}
          <Typography variant="t2" color="secondary">
            {t('store.home.insights.returnedHint')}
          </Typography>
          {returned.map((item, index) => (
            <View key={item.product_id} style={styles.row(index === 0)}>
              <Typography variant="t1" numberOfLines={1} style={styles.name}>
                {pickTranslatedName(item.translations, language)}
              </Typography>
              <Typography variant="t1" weight="medium" color="error">
                {t('store.home.insights.returnsCount', {
                  count: item.returns_count,
                })}
              </Typography>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

export default InsightsWidget

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing(3),
    padding: theme.spacing(4),
    gap: theme.spacing(4),
    ...theme.shadows.hard,
  },
  header: {
    gap: theme.spacing(1),
  },
  rating: {
    gap: theme.spacing(1),
    padding: theme.spacing(3),
    borderRadius: theme.radius.base,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },
  ratingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  row: (isFirst: boolean) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(3),
    paddingVertical: theme.spacing(2.5),
    borderTopWidth: isFirst ? 0 : 1,
    borderTopColor: theme.colors.stroke,
    marginTop: isFirst ? theme.spacing(1) : 0,
  }),
  name: {
    flex: 1,
  },
}))
