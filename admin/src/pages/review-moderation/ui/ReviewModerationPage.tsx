import { Check, Loader2, Star, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useReviewApproveMutation } from '../model/useReviewApproveMutation'
import { useReviewQueueQuery } from '../model/useReviewQueueQuery'
import { useReviewRejectMutation } from '../model/useReviewRejectMutation'
import { formatDate } from '@/shared/lib/formatDate'
import { cn } from '@/shared/lib/utils'
import { ReviewStatus } from '@/shared/openapi/requests'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Textarea } from '@/shared/ui/textarea'

const statusVariant = {
  [ReviewStatus.PENDING]: 'warning',
  [ReviewStatus.APPROVED]: 'success',
  [ReviewStatus.REJECTED]: 'destructive',
} as const

const TABS = [ReviewStatus.PENDING, ReviewStatus.APPROVED, ReviewStatus.REJECTED] as const

/** Оценка звёздами: пять символов читаются быстрее, чем число в колонке. */
const Stars = ({ value }: { value: number }) => (
  <span className="inline-flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={cn('size-3.5', star <= value ? 'text-amber-500' : 'text-muted-foreground/30')}
        fill={star <= value ? 'currentColor' : 'none'}
      />
    ))}
  </span>
)

/**
 * Проверка отзывов.
 *
 * Отзыв покупателя попадает на витрину только после проверки, и до этой
 * страницы проверять его было негде: очередь существовала в API, а экрана не
 * было. Отклонение требует причины — её видит автор, иначе отзыв просто
 * исчезает и непонятно, что исправить.
 */
export function ReviewModerationPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<ReviewStatus>(ReviewStatus.PENDING)
  const { data, isLoading } = useReviewQueueQuery(tab)
  const approve = useReviewApproveMutation()
  const reject = useReviewRejectMutation()

  const [rejectId, setRejectId] = useState<number | null>(null)
  const [comment, setComment] = useState('')

  const reviews = data?.data ?? []

  const closeReject = () => {
    setRejectId(null)
    setComment('')
  }

  return (
    <>
      <div className="mb-4 flex gap-2">
        {TABS.map((status) => (
          <Button
            key={status}
            size="sm"
            variant={tab === status ? 'default' : 'outline'}
            onClick={() => setTab(status)}
          >
            {t(`reviewStatus.${status}`)}
          </Button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead>ID</TableHead>
              <TableHead>{t('reviewModeration.product')}</TableHead>
              <TableHead>{t('reviewModeration.rating')}</TableHead>
              <TableHead>{t('reviewModeration.text')}</TableHead>
              <TableHead>{t('reviewModeration.author')}</TableHead>
              <TableHead>{t('fields.status')}</TableHead>
              <TableHead>{t('fields.createdAt')}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : reviews.length > 0 ? (
              reviews.map((review) => {
                const isBusy =
                  (approve.isPending && approve.variables === review.id) ||
                  (reject.isPending && reject.variables?.reviewId === review.id)

                return (
                  <TableRow key={review.id}>
                    <TableCell className="tabular-nums">{review.id}</TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {review.product_id}
                    </TableCell>
                    <TableCell>
                      <Stars value={review.rating} />
                    </TableCell>
                    {/* Текст не обрезаем в одну строку: решение принимается по
                        нему, и читать его надо целиком. */}
                    <TableCell className="max-w-100 whitespace-pre-line align-top">
                      {review.text || <span className="text-muted-foreground">—</span>}
                      {review.moderation_comment && (
                        <p className="mt-1 text-xs text-destructive">{review.moderation_comment}</p>
                      )}
                    </TableCell>
                    <TableCell>{review.author?.name ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[review.status]}>
                        {t(`reviewStatus.${review.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {review.created_at ? formatDate(review.created_at) : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {review.status !== ReviewStatus.REJECTED && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setRejectId(review.id)}
                            disabled={isBusy}
                          >
                            <X className="size-3.5" />
                            {t('moderation.decline')}
                          </Button>
                        )}
                        {review.status !== ReviewStatus.APPROVED && (
                          <Button
                            size="sm"
                            onClick={() => approve.mutate(review.id)}
                            isLoading={isBusy && approve.isPending}
                            disabled={isBusy}
                          >
                            <Check className="size-3.5" />
                            {t('moderation.approve')}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  {t('noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Отдельный диалог, а не общий ConfirmDialog: тому нечем принять текст, а
          причина отказа обязательна и на сервере. */}
      <Dialog open={rejectId !== null} onOpenChange={(open) => !open && closeReject()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('reviewModeration.rejectTitle')}</DialogTitle>
            <DialogDescription>{t('reviewModeration.rejectText')}</DialogDescription>
          </DialogHeader>
          <Textarea
            rows={3}
            value={comment}
            placeholder={t('reviewModeration.rejectPlaceholder')}
            onChange={(e) => setComment(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={closeReject} disabled={reject.isPending}>
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              disabled={!comment.trim() || reject.isPending}
              isLoading={reject.isPending}
              onClick={() => {
                if (rejectId === null) return
                reject.mutate(
                  { reviewId: rejectId, comment: comment.trim() },
                  { onSuccess: closeReject },
                )
              }}
            >
              {t('moderation.decline')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
