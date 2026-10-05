import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { PackageX } from 'lucide-react'
import type { ConfirmDialogRef } from '#/shared/ui/ConfirmDialog'
import {
  useCancelReturnReturnsRequestIdDelete,
  useListOwnReturnsReturnsMyGet,
} from '#/shared/openapi/queries'
import { useListOwnReturnsReturnsMyGetKey } from '#/shared/openapi/queries/common'
import { ReturnStatus } from '#/shared/openapi/requests'
import { Button } from '#/shared/ui/Button'
import { ConfirmDialog } from '#/shared/ui/ConfirmDialog'
import { ListSkeleton } from '#/shared/ui/ListSkeleton'
import { EmptyState } from '#/shared/ui/EmptyState'
import { cn } from '#/shared/utils/cn'
import { formatDate } from '#/shared/utils/formatDate'

const statusClass = {
  [ReturnStatus.PENDING]: 'bg-gray2 text-passive2',
  [ReturnStatus.APPROVED]: 'bg-blue1 text-blue-main',
  [ReturnStatus.REJECTED]: 'bg-red-50 text-failure',
} as const

/**
 * Свои заявки на возврат.
 *
 * В заказе состояние заявки видно рядом с товаром, но найти там заявку по
 * прошлой покупке — значит вспомнить, в каком заказе она была. Здесь всё
 * вместе, в том числе отклонённые: заявка после отказа не должна исчезать, иначе
 * непонятно, рассмотрели её или потеряли.
 */
export const ProfileReturnsPage = () => {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const cancelDialogRef = useRef<ConfirmDialogRef>(null)
  const [cancelId, setCancelId] = useState<number | null>(null)

  const { data: requests, isLoading } = useListOwnReturnsReturnsMyGet()

  const cancelReturn = useCancelReturnReturnsRequestIdDelete(undefined, {
    onSuccess: () => {
      toast.success(t('returns.cancelled'))
      void queryClient.invalidateQueries({ queryKey: [useListOwnReturnsReturnsMyGetKey] })
    },
  })

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="rounded-base bg-white p-4 shadow-base">
        <h1 className="p1 font-bold">{t('returns.title')}</h1>
        <p className="t1 mt-1 text-passive2">{t('returns.subtitle')}</p>
      </div>

      {isLoading && <ListSkeleton rows={3} rowClassName="h-28" />}

      {!isLoading && (requests ?? []).length === 0 && (
        <EmptyState icon={<PackageX size={40} strokeWidth={1.5} />} title={t('returns.empty')} />
      )}

      <ul className="flex flex-col gap-2">
        {(requests ?? []).map((request) => (
          <li key={request.id} className="rounded-base bg-white p-4 shadow-base">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gray2">
                  <PackageX width={18} height={18} className="text-passive2" />
                </div>
                <div className="min-w-0">
                  <p className="p3 font-medium">
                    {request.product_name || t('returns.unknownProduct')}
                  </p>
                  <p className="t1 text-passive2">
                    {t('returns.quantityShort', { count: Number(request.quantity) })}
                    {request.order_id
                      ? ` · ${t('returns.fromOrder', { id: request.order_id })}`
                      : ''}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  't2 rounded-full px-2.5 py-1 font-medium',
                  statusClass[request.status],
                )}
              >
                {request.received_at
                  ? t('returns.status.received')
                  : t(`returns.status.${request.status}`)}
              </span>
            </div>

            {/* Что дальше с одобренным возвратом: раньше покупатель видел
                «подтверждён» навсегда и не знал, дошёл ли товар. */}
            {request.status === ReturnStatus.APPROVED && (
              <p className="t1 mt-2 text-passive2">
                {request.received_at
                  ? t('returns.receivedOn', {
                      date: formatDate(request.received_at, i18n.language),
                    })
                  : t('returns.awaitingItem')}
              </p>
            )}

            <p className="t1 mt-3 whitespace-pre-line">{request.reason}</p>

            {/* Ответ платформы: при отказе он и есть объяснение, при
                подтверждении — уточнение, если его оставили. */}
            {request.resolution_comment && (
              <p
                className={cn(
                  't1 mt-2 whitespace-pre-line',
                  request.status === ReturnStatus.REJECTED ? 'text-failure' : 'text-passive2',
                )}
              >
                {request.resolution_comment}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              {request.created_at && (
                <p className="t2 text-passive1">{formatDate(request.created_at, i18n.language)}</p>
              )}
              {/* Отозвать можно только нерассмотренную: подтверждённая уже
                  изменила склад, отклонённая должна остаться видимой. */}
              {request.status === ReturnStatus.PENDING && (
                <Button
                  variant="tertiary"
                  size="sm"
                  className="text-failure"
                  onClick={() => {
                    setCancelId(request.id)
                    cancelDialogRef.current?.open()
                  }}
                >
                  {t('returns.cancel')}
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        ref={cancelDialogRef}
        title={t('returns.cancelTitle')}
        text={t('returns.cancelText')}
        confirmLabel={t('returns.cancel')}
        destructive
        busy={cancelReturn.isPending}
        onConfirm={() => {
          if (cancelId !== null) cancelReturn.mutate({ path: { request_id: cancelId } })
        }}
      />
    </div>
  )
}
