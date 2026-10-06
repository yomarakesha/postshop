import { Check, Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useReturnApproveMutation } from '../model/useReturnApproveMutation'
import { useReturnReceiveMutation } from '../model/useReturnReceiveMutation'
import { useReturnRejectMutation } from '../model/useReturnRejectMutation'
import { useReturnsQuery } from '../model/useReturnsQuery'
import { readTotalCount, useListControls } from '@/shared/hooks/useListControls'
import { formatDate } from '@/shared/lib/formatDate'
import { ReturnStatus, WarehouseType } from '@/shared/openapi/requests'
import type { ReturnResponse } from '@/shared/openapi/requests'
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
import { TablePagination } from '@/widgets/TablePagination'

const statusVariant = {
  [ReturnStatus.PENDING]: 'warning',
  [ReturnStatus.APPROVED]: 'success',
  [ReturnStatus.REJECTED]: 'destructive',
} as const

const TABS = [ReturnStatus.PENDING, ReturnStatus.APPROVED, ReturnStatus.REJECTED] as const

/** Что решается диалогом: подтвердить (причина необязательна) или отказать. */
type Decision = { requestId: number; kind: 'approve' | 'reject' }

/**
 * Отметка о получении: restock выбран кнопкой в строке (FBO) или ещё не
 * выбран (null) — сотрудник отмечает возврат FBS за продавца и решает в
 * диалоге, цел товар или брак.
 */
type Receiving = { request: ReturnResponse; restock: boolean | null }

/**
 * Заявки на возврат.
 *
 * Возврата не было вовсе: тип операции в журнале склада существовал, а завести
 * его было нечем. Товар физически возвращали, а в системе он оставался
 * проданным.
 *
 * Подтверждение только разрешает покупателю вернуть товар. Раньше сервер тем
 * же действием возвращал товар в остаток — до того, как его кто-то увидел, и
 * брак уходил обратно в продажу. Теперь остаток меняется в колонке
 * «Получение»: часть FBO получает склад Postshop (сотрудник, здесь), часть
 * FBS — продавец у себя; сотрудник может отметить её за него.
 */
export function ReturnRequestsPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<ReturnStatus>(ReturnStatus.PENDING)
  // Списки грузились одной порцией до 500 записей без страниц: дальше
  // запись было не найти. Теперь — постранично, с общим числом с сервера.
  const { page, setPage, pageSize, skip, limit } = useListControls()
  const { data, isLoading } = useReturnsQuery(tab, { skip, limit })
  const total = readTotalCount(data?.response.headers, data?.data.length ?? 0)
  const approve = useReturnApproveMutation()
  const reject = useReturnRejectMutation()
  const receive = useReturnReceiveMutation()
  const [receiving, setReceiving] = useState<Receiving | null>(null)

  const [decision, setDecision] = useState<Decision | null>(null)
  const [comment, setComment] = useState('')

  const requests = data?.data ?? []
  const isRejecting = decision?.kind === 'reject'
  const busy = approve.isPending || reject.isPending
  // Получение бывает только у подтверждённых возвратов: на других вкладках
  // колонка была бы пустой.
  const showReceipt = tab === ReturnStatus.APPROVED
  const columns = showReceipt ? 11 : 10

  const submitReceive = (restock: boolean) => {
    if (!receiving) return
    receive.mutate(
      { requestId: receiving.request.id, restock },
      { onSuccess: () => setReceiving(null) },
    )
  }

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
            onClick={() => {
              setTab(status)
              setPage(1)
            }}
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
              <TableHead className="text-right">{t('returnRequests.amount')}</TableHead>
              <TableHead>{t('returnRequests.reason')}</TableHead>
              <TableHead>{t('fields.status')}</TableHead>
              <TableHead>{t('fields.createdAt')}</TableHead>
              {showReceipt && <TableHead>{t('returnRequests.receipt')}</TableHead>}
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns} className="h-32 text-center">
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
                  {/* Сумма к возврату — цена на момент заказа × количество. */}
                  <TableCell className="tabular-nums text-right">
                    {request.amount != null ? parseFloat(request.amount).toFixed(2) : '—'}
                  </TableCell>
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
                  {showReceipt && (
                    <TableCell>
                      <ReceiptCell
                        request={request}
                        busy={receive.isPending}
                        onReceive={(restock) => setReceiving({ request, restock })}
                      />
                    </TableCell>
                  )}
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
                <TableCell colSpan={columns} className="h-32 text-center text-muted-foreground">
                  {t('noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />

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

      <Dialog open={receiving !== null} onOpenChange={(open) => !open && setReceiving(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('returnRequests.receiveTitle')}</DialogTitle>
            <DialogDescription>
              {t(
                receiving?.restock == null
                  ? 'returnRequests.receiveChooseText'
                  : receiving.restock
                    ? 'returnRequests.receiveRestockText'
                    : 'returnRequests.receiveDefectiveText',
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReceiving(null)}
              disabled={receive.isPending}
            >
              {t('cancel')}
            </Button>
            {/* Брак — необратимое решение «не продавать», поэтому красная кнопка. */}
            {receiving?.restock !== true && (
              <Button
                variant="destructive"
                disabled={receive.isPending}
                isLoading={receive.isPending && receive.variables?.restock === false}
                onClick={() => submitReceive(false)}
              >
                {t(
                  receiving?.restock === false
                    ? 'returnRequests.receiveDefective'
                    : 'returnRequests.defective',
                )}
              </Button>
            )}
            {receiving?.restock !== false && (
              <Button
                disabled={receive.isPending}
                isLoading={receive.isPending && receive.variables?.restock === true}
                onClick={() => submitReceive(true)}
              >
                {t(
                  receiving?.restock === true
                    ? 'returnRequests.receiveRestock'
                    : 'returnRequests.toStock',
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * Состояние получения подтверждённого возврата.
 *
 * Возврат FBO лежит на складе Postshop — получает сотрудник, кнопками здесь.
 * Возврат FBS едет продавцу, и отмечает его продавец у себя; сотруднику
 * оставлено скромное действие на случай, когда товар всё же у платформы.
 */
function ReceiptCell({
  request,
  busy,
  onReceive,
}: {
  request: ReturnResponse
  busy: boolean
  onReceive: (restock: boolean | null) => void
}) {
  const { t } = useTranslation()

  if (request.received_at) {
    return (
      <div className="space-y-1">
        <Badge variant={request.restocked ? 'success' : 'destructive'}>
          {t(
            request.restocked
              ? 'returnRequests.receivedRestocked'
              : 'returnRequests.receivedDefective',
          )}
        </Badge>
        <p className="text-xs text-muted-foreground tabular-nums">
          {formatDate(request.received_at)}
        </p>
      </div>
    )
  }

  if (request.warehouse_type === WarehouseType.FBO) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={busy} onClick={() => onReceive(true)}>
          {t('returnRequests.receiveRestock')}
        </Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => onReceive(false)}>
          {t('returnRequests.receiveDefective')}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{t('returnRequests.sellerReceives')}</p>
      <Button
        size="xs"
        variant="link"
        className="px-0 text-muted-foreground"
        disabled={busy}
        onClick={() => onReceive(null)}
      >
        {t('returnRequests.receiveForSeller')}
      </Button>
    </div>
  )
}
