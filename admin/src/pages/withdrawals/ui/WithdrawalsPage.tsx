import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { readTotalCount, useListControls } from '@/shared/hooks/useListControls'
import { formatDate } from '@/shared/lib/formatDate'
import {
  WithdrawalStatus,
  completeWithdrawalWithdrawalsRequestIdCompletePost,
  listWithdrawalsWithdrawalsGet,
  rejectWithdrawalWithdrawalsRequestIdRejectPost,
} from '@/shared/openapi/requests'
import type { WithdrawalResponse } from '@/shared/openapi/requests'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Textarea } from '@/shared/ui/textarea'
import { TablePagination } from '@/widgets/TablePagination'

const TABS = [
  WithdrawalStatus.PENDING,
  WithdrawalStatus.COMPLETED,
  WithdrawalStatus.REJECTED,
  WithdrawalStatus.CANCELLED,
] as const

const statusVariant = {
  [WithdrawalStatus.PENDING]: 'warning',
  [WithdrawalStatus.COMPLETED]: 'success',
  [WithdrawalStatus.REJECTED]: 'destructive',
  [WithdrawalStatus.CANCELLED]: 'default',
} as const

/**
 * Заявки продавцов FBO на вывоз своего товара со складов Postshop.
 *
 * Раньше продавец забрать товар не мог никак: возврат магазину оформлял
 * только сотрудник, и только если сам знал, что продавец этого хочет.
 * «Выполнить» — товар передан продавцу: сервер снимает его со складов и ещё
 * раз проверяет, что он не занят открытыми заказами.
 */
export function WithdrawalsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<WithdrawalStatus>(WithdrawalStatus.PENDING)
  const { page, setPage, pageSize, skip, limit } = useListControls()

  const { data, isLoading } = useQuery({
    queryKey: ['withdrawals', tab, skip, limit],
    queryFn: () =>
      listWithdrawalsWithdrawalsGet({ query: { status: tab, skip, limit }, throwOnError: true }),
  })
  const requests = data?.data ?? []
  const total = readTotalCount(data?.response.headers, requests.length)

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['withdrawals'] })

  const [completing, setCompleting] = useState<WithdrawalResponse | null>(null)
  const [rejecting, setRejecting] = useState<WithdrawalResponse | null>(null)
  const [reason, setReason] = useState('')

  const complete = useMutation({
    mutationFn: (id: number) =>
      completeWithdrawalWithdrawalsRequestIdCompletePost({
        path: { request_id: id },
        throwOnError: true,
      }),
    onSuccess: () => {
      setCompleting(null)
      void refresh()
      void queryClient.invalidateQueries({ queryKey: ['warehouse-balances'] })
    },
  })
  const reject = useMutation({
    mutationFn: ({ id, comment }: { id: number; comment: string }) =>
      rejectWithdrawalWithdrawalsRequestIdRejectPost({
        path: { request_id: id },
        body: { resolution_comment: comment },
        throwOnError: true,
      }),
    onSuccess: () => {
      setRejecting(null)
      setReason('')
      void refresh()
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
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
            {t(`withdrawals.status.${status}`)}
          </Button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead className="w-12">ID</TableHead>
              <TableHead>{t('withdrawals.shop')}</TableHead>
              <TableHead>{t('withdrawals.items')}</TableHead>
              <TableHead>{t('withdrawals.comment')}</TableHead>
              <TableHead>{t('fields.status')}</TableHead>
              <TableHead>{t('fields.createdAt')}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : requests.length > 0 ? (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="tabular-nums text-muted-foreground">{request.id}</TableCell>
                  <TableCell className="font-medium">
                    {request.shop_name ?? `#${request.shop_id}`}
                  </TableCell>
                  <TableCell>
                    <ul className="space-y-0.5 text-sm">
                      {request.items.map((item) => (
                        <li key={item.id}>
                          {item.product_name ?? `#${item.product_id}`} —{' '}
                          <span className="tabular-nums">
                            {Number(item.quantity)} {item.measure_unit_code ?? ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell className="max-w-64 text-sm text-muted-foreground">
                    {request.comment ?? '—'}
                    {request.resolution_comment && (
                      <p className="text-destructive">{request.resolution_comment}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[request.status]}>
                      {t(`withdrawals.status.${request.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {request.created_at ? formatDate(request.created_at) : '—'}
                  </TableCell>
                  <TableCell>
                    {request.status === WithdrawalStatus.PENDING && (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" onClick={() => setCompleting(request)}>
                          {t('withdrawals.complete')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive"
                          onClick={() => {
                            setReason('')
                            setRejecting(request)
                          }}
                        >
                          {t('withdrawals.reject')}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  {t('noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />

      <ConfirmDialog
        open={completing !== null}
        onOpenChange={(open) => !open && setCompleting(null)}
        title={t('withdrawals.completeTitle', { id: completing?.id ?? '' })}
        description={t('withdrawals.completeText')}
        confirmLabel={t('withdrawals.complete')}
        busy={complete.isPending}
        onConfirm={() => completing && complete.mutate(completing.id)}
      />
      <ConfirmDialog
        open={rejecting !== null}
        onOpenChange={(open) => !open && setRejecting(null)}
        title={t('withdrawals.rejectTitle', { id: rejecting?.id ?? '' })}
        description={
          <div className="space-y-2">
            <p>{t('withdrawals.rejectText')}</p>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('withdrawals.rejectPlaceholder')}
              rows={3}
            />
          </div>
        }
        confirmLabel={t('withdrawals.reject')}
        destructive
        busy={reject.isPending}
        onConfirm={() => {
          if (!rejecting || !reason.trim()) return
          reject.mutate({ id: rejecting.id, comment: reason.trim() })
        }}
      />
    </div>
  )
}
