import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PackageX } from 'lucide-react'
import type { ReturnResponse } from '#/shared/openapi/requests'
import type { ConfirmDialogRef } from '#/shared/ui/ConfirmDialog'
import {
  useListShopReturnsReturnsShopShopIdGet,
  useReceiveReturnReturnsRequestIdReceivePatch,
} from '#/shared/openapi/queries'
import { useListShopReturnsReturnsShopShopIdGetKey } from '#/shared/openapi/queries/common'
import { ReturnStatus, WarehouseType } from '#/shared/openapi/requests'
import { Button } from '#/shared/ui/Button'
import { ConfirmDialog } from '#/shared/ui/ConfirmDialog'
import { EmptyState } from '#/shared/ui/EmptyState'
import { ListSkeleton } from '#/shared/ui/ListSkeleton'
import { cn } from '#/shared/utils/cn'
import { formatDate } from '#/shared/utils/formatDate'

const statusClass = {
  [ReturnStatus.PENDING]: 'bg-gray2 text-passive2',
  [ReturnStatus.APPROVED]: 'bg-blue1 text-blue-main',
  [ReturnStatus.REJECTED]: 'bg-red-50 text-failure',
} as const

/**
 * Возвраты по товарам магазина — глазами продавца.
 *
 * Об оформленном возврате продавцу приходило уведомление, а посмотреть его было
 * негде: список заявок доступен только платформе, и экрана в кабинете не
 * существовало. Продавец узнавал, что возврат случился, и не мог узнать ни по
 * какому товару, ни по какой причине. На панели показателей при этом висел
 * счётчик «Возвращали» — число без единой подробности.
 *
 * Решение по заявке принимает платформа — его кнопок здесь нет. Но одобрение
 * больше не возвращает товар в остаток само: раньше остаток рос в момент
 * одобрения, когда товар ещё ехал обратно, и его успевали продать второй раз.
 * Теперь продавец FBS отмечает здесь, что товар доехал, и решает: цел — в
 * продажу, брак — остаток не трогаем. Возврат по части FBO принимает склад
 * Postshop (продавцу сервер ответит 403), поэтому там только пояснение.
 */
export const MyStoreReturnsPage = () => {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const { storeId } = useParams({ from: '/my-store/$storeId' })
  const defectiveDialogRef = useRef<ConfirmDialogRef>(null)
  // Какой возврат ждёт подтверждения «брак»: диалог один на страницу.
  const [defectiveId, setDefectiveId] = useState<number | null>(null)

  const { data: requests, isLoading } = useListShopReturnsReturnsShopShopIdGet({
    path: { shop_id: Number(storeId) },
  })

  const receive = useReceiveReturnReturnsRequestIdReceivePatch(undefined, {
    onSuccess: () => {
      toast.success(t('storeReturns.receivedSaved'))
      void queryClient.invalidateQueries({ queryKey: [useListShopReturnsReturnsShopShopIdGetKey] })
    },
  })

  const markReceived = (requestId: number, restock: boolean) =>
    receive.mutate({ path: { request_id: requestId }, body: { restock } })

  const items = requests ?? []

  /** Что делать продавцу с одобренным возвратом — или что с ним уже сделано. */
  const renderReceipt = (request: ReturnResponse) => {
    if (request.status !== ReturnStatus.APPROVED) return null

    if (request.received_at) {
      return (
        <p className="t1 mt-3 font-medium text-passive2">
          {t(request.restocked ? 'storeReturns.restocked' : 'storeReturns.defective')}
          {' · '}
          {formatDate(request.received_at, i18n.language)}
        </p>
      )
    }

    if (request.warehouse_type === WarehouseType.FBO) {
      return <p className="t1 mt-3 text-passive2">{t('storeReturns.fboWarehouse')}</p>
    }

    const busy = receive.isPending && receive.variables.path.request_id === request.id
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" disabled={busy} onClick={() => markReceived(request.id, true)}>
          {t('storeReturns.receiveRestock')}
        </Button>
        <Button
          size="sm"
          variant="tertiary"
          className="text-failure"
          disabled={busy}
          onClick={() => {
            setDefectiveId(request.id)
            defectiveDialogRef.current?.open()
          }}
        >
          {t('storeReturns.receiveDefective')}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="rounded-base bg-white p-4 shadow-base">
        <h1 className="p1 font-bold">{t('storeReturns.title')}</h1>
        <p className="t1 mt-1 text-passive2">{t('storeReturns.subtitle')}</p>
      </div>

      {isLoading && <ListSkeleton rows={3} rowClassName="h-28" />}

      {!isLoading && items.length === 0 && (
        <EmptyState icon={<PackageX size={40} strokeWidth={1.5} />} title={t('returns.empty')} />
      )}

      <ul className="flex flex-col gap-2">
        {items.map((request) => (
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
                    {request.amount != null
                      ? ` · ${parseFloat(request.amount).toFixed(2)} ${t('dashboard.revenue.currency')}`
                      : ''}
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
                {t(`returns.status.${request.status}`)}
              </span>
            </div>

            {/* Кто вернул: без этого продавец видит «вернули товар» и не может
                ни связаться с человеком, ни сопоставить с заказом. */}
            {(request.buyer_name || request.buyer_phone) && (
              <p className="t1 mt-3 text-passive2">
                {[request.buyer_name, request.buyer_phone].filter(Boolean).join(' · ')}
              </p>
            )}

            <p className="t1 mt-2 whitespace-pre-line">{request.reason}</p>

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

            {renderReceipt(request)}

            {request.created_at && (
              <p className="t2 mt-3 text-passive1">
                {formatDate(request.created_at, i18n.language)}
              </p>
            )}
          </li>
        ))}
      </ul>

      {/* Брак — без возврата в продажу и без отмены: переспрашиваем. */}
      <ConfirmDialog
        ref={defectiveDialogRef}
        title={t('storeReturns.defectiveTitle')}
        text={t('storeReturns.defectiveText')}
        confirmLabel={t('storeReturns.defectiveConfirm')}
        destructive
        busy={receive.isPending}
        onConfirm={() => {
          if (defectiveId !== null) markReceived(defectiveId, false)
        }}
      />
    </div>
  )
}
