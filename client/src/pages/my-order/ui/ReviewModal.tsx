import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Star } from 'lucide-react'
import type { ModalRef } from '#/shared/ui/Modal'
import { Modal } from '#/shared/ui/Modal'
import { Button } from '#/shared/ui/Button'
import { TextArea } from '#/shared/ui/TextArea'
import { useCreateReviewReviewsPost } from '#/shared/openapi/queries'
import {
  useListOwnReviewsReviewsMyGetKey,
  useReviewEligibilityReviewsProductProductIdEligibilityGetKey,
} from '#/shared/openapi/queries/common'
import { settled } from '#/shared/lib/settled'

const STARS = [1, 2, 3, 4, 5] as const

export interface ReviewModalRef {
  open: (productId: number, productName: string) => void
}

/**
 * Оценка купленного товара со страницы заказа.
 *
 * Страница заказа — единственное место, где человек точно помнит, что именно он
 * покупал. Оставлять отзыв только на карточке товара значило бы просить его
 * сначала эти карточки найти.
 */
export const ReviewModal = forwardRef<ReviewModalRef>((_, ref) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const modalRef = useRef<ModalRef>(null)

  const [product, setProduct] = useState<{ id: number; name: string } | null>(null)
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')

  useImperativeHandle(ref, () => ({
    open: (productId, productName) => {
      setProduct({ id: productId, name: productName })
      setRating(0)
      setText('')
      modalRef.current?.open()
    },
  }))

  const createReview = useCreateReviewReviewsPost(undefined, {
    onSuccess: () => {
      toast.success(t('reviews.sent'))
      modalRef.current?.close()
      void queryClient.invalidateQueries({ queryKey: [useListOwnReviewsReviewsMyGetKey] })
      void queryClient.invalidateQueries({
        queryKey: [useReviewEligibilityReviewsProductProductIdEligibilityGetKey],
      })
    },
  })

  const submit = async () => {
    if (!product) return
    if (rating === 0) {
      toast.error(t('reviews.ratingRequired'))
      return
    }
    await settled(
      createReview.mutateAsync({
        body: { product_id: product.id, rating, text: text.trim() || null },
      }),
    )
  }

  return (
    <Modal ref={modalRef} className="w-full max-w-110 p-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="p2 font-bold">{t('reviews.rateTitle')}</h2>
          {product && <p className="t1 mt-1 text-passive2">{product.name}</p>}
        </div>

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
                width={28}
                height={28}
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
        <p className="t2 text-passive2">{t('reviews.moderationNotice')}</p>

        <div className="flex gap-3">
          <Button disabled={createReview.isPending} onClick={submit}>
            {createReview.isPending ? t('reviews.sending') : t('reviews.send')}
          </Button>
          <Button variant="tertiary" onClick={() => modalRef.current?.close()}>
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </Modal>
  )
})

ReviewModal.displayName = 'ReviewModal'
