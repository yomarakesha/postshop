import { Check, Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useReturnApproveMutation } from '../model/useReturnApproveMutation'
import { useReturnRejectMutation } from '../model/useReturnRejectMutation'
import { useReturnsQuery } from '../model/useReturnsQuery'
import { formatDate } from '@/shared/lib/formatDate'
import { ReturnStatus } from '@/shared/openapi/requests'
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
  [ReturnStatus.PENDING]: 'warning',
  [ReturnStatus.APPROVED]: 'success',
  [ReturnStatus.REJECTED]: 'destructive',
} as const

const TABS = [ReturnStatus.PENDING, ReturnStatus.APPROVED, ReturnStatus.REJECTED] as const

/** Что решается диалогом: подтвердить (причина необязательна) или отказать. */
type Decision = { requestId: number; kind: 'approve' | 'reject' }

/**
 * Заявки на возврат.
 *
 * Возврата не было вовсе: тип операции в журнале склада существовал, а завести
 * его было нечем. Товар физически возвращали, а в системе он оставался
 * проданным.
 *
 * Подтверждение — это утверждение, что товар у платформы: сервер тем же
 * действием возвращает его на склад. Поэтому спрашиваем подтверждение и здесь,
 * а не подтверждаем одним кликом из строки таблицы.
 */
export function ReturnRequestsPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<ReturnStatus>(ReturnStatus.PENDING)
  const { data, isLoading } = useReturnsQuery(tab)
  const approve = useReturnApproveMutation()
  const reject = useReturnRejectMutation()

  const [decision, setDecision] = useState<Decision | null>(null)
  const [comment, setComment] = useState('')

  const requests = data?.data ?? []
  const isRejecting = decision?.kind === 'reject'
  const busy = approve.isPending || reject.isPending

  const close = () => {
    setDecision(null)
    setComment('')
  }

  const submit = () => {
    if (!decision) return
    if (decision.kind === 'approve') {
      approve.mutate(
        { requestId: decision.requestId, comment: comment.trim() || undefined },
        { onSuccess: close },
      )
      return
    }
    reject.mutate({ requestId: decision.requestId, comment: comment.trim() }, { onSuccess: close })
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
            {t(`returnStatus.${status}`)}
          </Button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead>ID</TableHead>
              <TableHead>{t('returnRequests.order')}</TableHead>
              <TableHead>{t('returnRequests.buyer')}</TableHead>
              <TableHead>{t('returnRequests.product')}</TableHead>
              <TableHead>{t('returnRequests.quantity')}</TableHead>
              <TableHead>{t('returnRequests.reason')}</TableHead>
              <TableHead>{t('fields.status')}</TableHead>
              <TableHead>{t('fields.createdAt')}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center">
                  <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : requests.length > 0 ? (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="tabular-nums">{request.id}</TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {request.order_id ?? '—'}
                  </TableCell>
                  {/* Кто просит возврат. В списке был только номер заказа, и
                      чтобы понять, с кем разговаривать, приходилось идти в
                      раздел заказов и искать заказ там. */}
                  <TableCell className="whitespace-nowrap">
                    <span className="font-medium">
                      {request.buyer_name ?? `#${request.user_id}`}
                    </span>
                    {request.buyer_phone && (
                      <span className="block text-xs text-muted-foreground tabular-nums">
                        {request.buyer_phone}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {request.product_name ?? `#${request.product_id ?? '—'}`}
                  </TableCell>
                  <TableCell className="tabular-nums">{request.quantity}</TableCell>
                  {/* Причину не обрезаем: решение принимается по ней. */}
                  <TableCell className="max-w-100 whitespace-pre-line align-top">
                    {request.reason}
                    {request.resolution_comment && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {request.resolution_comment}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[request.status]}>
                      {t(`returnStatus.${request.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {request.created_at ? formatDate(request.created_at) : '—'}
                  </TableCell>
                  <TableCell>
                    {/* Решение принимается один раз: у разобранной заявки
                        кнопок нет — сервер второе решение и не примет. */}
                    {request.status === ReturnStatus.PENDING && (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={busy}
                          onClick={() => setDecision({ requestId: request.id, kind: 'reject' })}
                        >
                          <X className="size-3.5" />
                          {t('moderation.decline')}
                        </Button>
                        <Button
                          size="sm"
                          disabled={busy}
                          onClick={() => setDecision({ requestId: request.id, kind: 'approve' })}
                        >
                          <Check className="size-3.5" />
                          {t('moderation.approve')}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                  {t('noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={decision !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t(isRejecting ? 'returnRequests.rejectTitle' : 'returnRequests.approveTitle')}
            </DialogTitle>
            <DialogDescription>
              {t(isRejecting ? 'returnRequests.rejectText' : 'returnRequests.approveText')}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={3}
            value={comment}
            placeholder={t(
              isRejecting
                ? 'returnRequests.rejectPlaceholder'
                : 'returnRequests.approvePlaceholder',
            )}
            onChange={(e) => setComment(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={close} disabled={busy}>
              {t('cancel')}
            </Button>
            <Button
              variant={isRejecting ? 'destructive' : 'default'}
              // При отказе причина обязательна, при подтверждении — нет:
              // подтверждать нечего объяснять, отказ без объяснения бесполезен.
              disabled={busy || (isRejecting && !comment.trim())}
              isLoading={busy}
              onClick={submit}
            >
              {t(isRejecting ? 'moderation.decline' : 'moderation.approve')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
