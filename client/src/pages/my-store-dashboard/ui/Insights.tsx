import { Eye, PackageX, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParams } from '@tanstack/react-router'
import { useGetShopInsightsOrdersShopShopIdInsightsGet } from '#/shared/openapi/queries'
import { getTranslatedName } from '#/shared/utils/getTranslatedName'
import { RatingStars } from '#/shared/ui/RatingStars'

/** Больше десяти строк в списке никто не разбирает — остальное только шумит. */
const VISIBLE = 10

/**
 * Списки, по которым продавцу есть что сделать.
 *
 * Сводка отвечает на «как дела», этот блок — на «что чинить»: какие товары
 * смотрят и не покупают, какие возвращают, как магазин оценивают. Все три
 * вопроса раньше не имели ответа нигде: рейтинг магазина считался, но
 * продавцу не показывался вообще.
 */
export const Insights = () => {
  const { t, i18n } = useTranslation()
  const { storeId } = useParams({ from: '/my-store/$storeId' })
  const currency = t('dashboard.revenue.currency')

  const { data } = useGetShopInsightsOrdersShopShopIdInsightsGet({
    path: { shop_id: Number(storeId) },
  })

  if (!data) return null

  // Поля со значением по умолчанию на сервере в схеме необязательны —
  // подставляем то же самое, чтобы не разбирать undefined в разметке.
  const unsold = (data.unsold ?? []).slice(0, VISIBLE)
  const returned = (data.returned ?? []).slice(0, VISIBLE)
  const ratingCount = data.rating_count ?? 0
  const newReviews = data.new_reviews ?? 0

  return (
    <div className="flex flex-col gap-5 p-5">
      <div>
        <p className="p2 font-semibold">{t('dashboard.insights.title')}</p>
        <p className="t1 mt-0.5 text-passive1">{t('dashboard.insights.subtitle')}</p>
      </div>

      {/* Рейтинг считался с первого отзыва, но продавец его не видел. */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-base border border-stroke p-4">
        <div className="flex items-center gap-2">
          <Star size={18} className="text-warning" fill="currentColor" />
          {ratingCount > 0 ? (
            <>
              <span className="p1 font-bold">{Number(data.rating_avg ?? 0).toFixed(1)}</span>
              <RatingStars value={data.rating_avg ?? 0} count={ratingCount} />
            </>
          ) : (
            <span className="t1 text-passive2">{t('dashboard.insights.noRating')}</span>
          )}
        </div>
        {newReviews > 0 && (
          <span className="t1 text-passive2">
            {t('dashboard.insights.newReviews', { count: newReviews })}
          </span>
        )}
      </div>

      {unsold.length > 0 && (
        <div>
          <p className="p3 font-medium">{t('dashboard.insights.unsold')}</p>
          {/* Сортировка по просмотрам: товар, который смотрят и не покупают, —
              самый понятный повод поменять цену или фотографию. */}
          <p className="t2 mt-0.5 text-passive2">{t('dashboard.insights.unsoldHint')}</p>
          <ul className="mt-2 divide-y divide-stroke">
            {unsold.map((item) => (
              <li key={item.product_id} className="flex items-center gap-3 py-2.5">
                <p className="t1 line-clamp-1 min-w-0 flex-1">
                  {getTranslatedName(item.translations, i18n.language)}
                </p>
                <span className="t2 flex shrink-0 items-center gap-1 text-passive2">
                  <Eye size={13} />
                  {item.views_count}
                </span>
                <span className="t1 shrink-0 font-medium">
                  {Math.round(Number(item.price))} {currency}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {returned.length > 0 && (
        <div>
          <p className="p3 font-medium">{t('dashboard.insights.returned')}</p>
          {/* Один возврат — случайность, три на один товар — брак партии. */}
          <p className="t2 mt-0.5 text-passive2">{t('dashboard.insights.returnedHint')}</p>
          <ul className="mt-2 divide-y divide-stroke">
            {returned.map((item) => (
              <li key={item.product_id} className="flex items-center gap-3 py-2.5">
                <PackageX size={15} className="shrink-0 text-failure" />
                <p className="t1 line-clamp-1 min-w-0 flex-1">
                  {getTranslatedName(item.translations, i18n.language)}
                </p>
                <span className="t1 shrink-0 font-medium text-failure">
                  {t('dashboard.insights.returnsCount', { count: item.returns_count })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
