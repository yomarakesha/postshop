import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Star } from 'lucide-react'
import {
  useCreateReviewReviewsPost,
  useListOwnReviewsReviewsMyGet,
  useListProductReviewsReviewsProductProductIdGet,
  useProductReviewSummaryReviewsProductProductIdSummaryGet,
  useReviewEligibilityReviewsProductProductIdEligibilityGet,
} from '#/shared/openapi/queries'
import {
  useListOwnReviewsReviewsMyGetKey,
  useListProductReviewsReviewsProductProductIdGetKey,
  useProductReviewSummaryReviewsProductProductIdSummaryGetKey,
  useReviewEligibilityReviewsProductProductIdEligibilityGetKey,
} from '#/shared/openapi/queries/common'
import { ReviewStatus } from '#/shared/openapi/requests'
import { useProfileStore } from '#/shared/stores/profileStore'
import { RatingStars } from '#/shared/ui/RatingStars'
import { Button } from '#/shared/ui/Button'
import { TextArea } from '#/shared/ui/TextArea'
import { settled } from '#/shared/lib/settled'
import { cn } from '#/shared/utils/cn'
import { formatDate } from '#/shared/utils/formatDate'

const STARS = [1, 2, 3, 4, 5] as const

interface Props {
  productId: number
}

/**
 * Отзывы о товаре: сводка, список и форма для того, кто товар купил.
 *
 * Отзывов на витрине не было вовсе. Форма показывается только тому, кто имеет
 * право оставить отзыв — право спрашивается у сервера отдельным методом, потому
 * что правило неочевидное (нужен завершённый заказ с этим товаром), и получить
 * отказ после набранного текста — худший из возможных вариантов.
 */
export const ProductReviews = ({ productId }: Props) => {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const profile = useProfileStore((s) => s.profile)

  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')

  const { data: summary } = useProductReviewSummaryReviewsProductProductIdSummaryGet({
    path: { product_id: productId },
  })
  const { data: reviews } = useListProductReviewsReviewsProductProductIdGet({
    path: { product_id: productId },
  })
  const { data: eligibility } = useReviewEligibilityReviewsProductProductIdEligibilityGet(
    { path: { product_id: productId } },
    undefined,
    { enabled: Boolean(profile) },
  )
  // Свой отзыв нужен, чтобы показать его состояние: непроверенный и отклонённый
  // на витрине не видны, и без этого он после отправки просто пропадает.
  const { data: ownReviews } = useListOwnReviewsReviewsMyGet({}, undefined, {
    enabled: Boolean(profile) && eligibility?.existing_review_id != null,
  })
  const ownReview = (ownReviews ?? []).find((row) => row.product_id === productId)

  const createReview = useCreateReviewReviewsPost(undefined, {
    onSuccess: () => {
      toast.success(t('reviews.sent'))
      setRating(0)
      setText('')
      void queryClient.invalidateQueries({
        queryKey: [useReviewEligibilityReviewsProductProductIdEligibilityGetKey],
      })
      void queryClient.invalidateQueries({ queryKey: [useListOwnReviewsReviewsMyGetKey] })
      void queryClient.invalidateQueries({
        queryKey: [useListProductReviewsReviewsProductProductIdGetKey],
      })
      void queryClient.invalidateQueries({
        queryKey: [useProductReviewSummaryReviewsProductProductIdSummaryGetKey],
      })
    },
  })

  const submit = async () => {
    if (rating === 0) {
      toast.error(t('reviews.ratingRequired'))
      return
    }
    await settled(
      createReview.mutateAsync({
        body: { product_id: productId, rating, text: text.trim() || null },
      }),
    )
  }

  const count = summary?.rating_count ?? 0
  const breakdown = summary?.breakdown ?? {}

  return (
    <div className="flex flex-col gap-4">
      <h3 className="p3 pl-4 font-semibold">{t('reviews.title')}</h3>

      <div className="flex flex-col gap-4 rounded-base border border-stroke bg-white p-4 shadow-base">
        {count === 0 ? (
          <p className="p3 text-passive2">{t('reviews.none')}</p>
        ) : (
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-col items-center gap-1">
              <p className="h2 font-bold">{Number(summary?.rating_avg ?? 0).toFixed(1)}</p>
              <RatingStars value={summary?.rating_avg ?? 0} size={16} />
              <p className="t2 text-passive2">{t('reviews.count', { count })}</p>
            </div>
            {/* Гистограмма: без неё средняя оценка не говорит о разбросе —
                4.0 из двух пятёрок и двух троек читается иначе, чем 4.0 из
                четырёх четвёрок. */}
            <div className="flex min-w-50 flex-1 flex-col gap-1">
              {[5, 4, 3, 2, 1].map((star) => {
                // Сервер отдаёт все пять оценок, включая нулевые — страховка не нужна.
                const value = breakdown[star]
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="t2 w-3 text-right text-passive2">{star}</span>
                    <Star
                      width={12}
                      height={12}
                      className="shrink-0 text-warning"
                      fill="currentColor"
                    />
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray2">
                      <div
                        className="h-full rounded-full bg-warning"
                        style={{ width: `${count > 0 ? (value / count) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="t2 w-6 text-passive2">{value}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Состояние своего отзыва: подтверждённый виден в списке ниже, а
            непроверенный и отклонённый — только здесь. */}
        {ownReview && ownReview.status !== ReviewStatus.APPROVED && (
          <div
            className={cn(
              'rounded-base p-3',
              ownReview.status === ReviewStatus.REJECTED ? 'bg-red-50' : 'bg-gray2',
            )}
          >
            <div className="flex items-center gap-2">
              <RatingStars value={ownReview.rating} />
              <p className="t1 font-medium">
                {t(
                  ownReview.status === ReviewStatus.REJECTED
                    ? 'reviews.yoursRejected'
                    : 'reviews.yoursPending',
                )}
              </p>
            </div>
            {ownReview.text && <p className="t1 mt-1 text-passive2">{ownReview.text}</p>}
            {ownReview.moderation_comment && (
              <p className="t2 mt-1 text-failure">{ownReview.moderation_comment}</p>
            )}
          </div>
        )}

        {eligibility?.can_review && (
          <div className="flex flex-col gap-3 border-t border-stroke pt-4">
            <p className="p3 font-medium">{t('reviews.leaveTitle')}</p>
            <div className="flex items-center gap-1">
              {STARS.map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={String(star)}
                  onClick={() => setRating(star)}
                  className="cursor-pointer"
                >
                  <Star
                    width={26}
                    height={26}
                    className={star <= rating ? 'text-warning' : 'text-stroke'}
                    fill={star <= rating ? 'currentColor' : 'none'}
                  />
                </button>
              ))}
            </div>
            <TextArea
              rows={3}
              placeholder={t('reviews.textPlaceholder')}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            {/* Про проверку говорим заранее: иначе отправленный отзыв не
                появляется на странице и выглядит потерянным. */}
            <p className="t2 text-passive2">{t('reviews.moderationNotice')}</p>
            <div className="flex">
              <Button disabled={createReview.isPending} onClick={submit}>
                {createReview.isPending ? t('reviews.sending') : t('reviews.send')}
              </Button>
            </div>
          </div>
        )}

        {/* Почему формы нет — иначе её отсутствие читается как поломка. */}
        {profile && eligibility?.reason === 'not_purchased' && (
          <p className="t2 border-t border-stroke pt-4 text-passive2">
            {t('reviews.onlyAfterPurchase')}
          </p>
        )}
      </div>

      {(reviews ?? []).length > 0 && (
        <ul className="flex flex-col gap-2">
          {(reviews ?? []).map((review) => (
            <li
              key={review.id}
              className="flex flex-col gap-1 rounded-base border border-stroke bg-white p-4 shadow-base"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                {/* Сначала кто, потом какая оценка: строка читается как
                    предложение, а звёзды перед именем выглядели меткой самого
                    имени. */}
                <div className="flex items-center gap-2">
                  <p className="t1 font-medium">{review.author?.name || t('reviews.anonymous')}</p>
                  <RatingStars value={review.rating} />
                </div>
                {review.created_at && (
                  <p className="t2 text-passive2">{formatDate(review.created_at, i18n.language)}</p>
                )}
              </div>
              {review.text && <p className="p3 whitespace-pre-line">{review.text}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
