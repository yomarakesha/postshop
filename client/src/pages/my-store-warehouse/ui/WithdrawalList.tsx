import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PackageMinus } from 'lucide-react'
import {
  useCancelWithdrawalWithdrawalsRequestIdCancelPost,
  useListShopWithdrawalsWithdrawalsShopShopIdGet,
} from '#/shared/openapi/queries'
import { useListShopWithdrawalsWithdrawalsShopShopIdGetKey } from '#/shared/openapi/queries/common'
import { WithdrawalStatus } from '#/shared/openapi/requests'
import { getErrorMessage } from '#/shared/lib/apiError'
import { Button } from '#/shared/ui/Button'
import { EmptyState } from '#/shared/ui/EmptyState'
import { ListSkeleton } from '#/shared/ui/ListSkeleton'
import { cn } from '#/shared/utils/cn'
import { formatDate } from '#/shared/utils/formatDate'

const statusClass = {
  [WithdrawalStatus.PENDING]: 'bg-gray2 text-passive2',
  [WithdrawalStatus.COMPLETED]: 'bg-blue1 text-blue-main',
  [WithdrawalStatus.REJECTED]: 'bg-red-50 text-failure',
  [WithdrawalStatus.CANCELLED]: 'bg-gray2 text-passive1',
} as const

/** Заявки магазина на вывоз товара со склада Postshop. */
export const WithdrawalList = ({ shopId }: { shopId: number }) => {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()

  const { data, isLoading } = useListShopWithdrawalsWithdrawalsShopShopIdGet({
    path: { shop_id: shopId },
    query: { lang: i18n.language, limit: 100 },
  })
  const cancel = useCancelWithdrawalWithdrawalsRequestIdCancelPost(undefined, {
    onSuccess: () => {
      toast.success(t('withdrawal.cancelled'))
      void queryClient.invalidateQueries({
        queryKey: [useListShopWithdrawalsWithdrawalsShopShopIdGetKey],
      })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const items = data ?? []

  return (
    <div className="flex flex-col gap-2">
      <p className="t1 px-1 text-passive2">{t('withdrawal.hint')}</p>
      {isLoading && <ListSkeleton rows={3} rowClassName="h-24" />}
      {!isLoading && items.length === 0 && (
        <EmptyState
          icon={<PackageMinus size={40} strokeWidth={1.5} />}
          title={t('withdrawal.empty')}
        />
      )}
      <ul className="flex flex-col gap-2">
        {items.map((request) => (
          <li key={request.id} className="rounded-base bg-white p-4 shadow-base">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="p3 font-medium">{t('withdrawal.number', { id: request.id })}</p>
                {request.items.map((item) => (
                  <p key={item.id} className="t1 text-passive2">
                    {item.product_name ?? `#${item.product_id}`} — {Number(item.quantity)}{' '}
                    {item.measure_unit_code ?? ''}
                  </p>
                ))}
              </div>
              <span
                className={cn(
                  't2 rounded-full px-2.5 py-1 font-medium',
                  statusClass[request.status],
                )}
              >
                {t(`withdrawal.status.${request.status}`)}
              </span>
            </div>
            {request.comment && <p className="t1 mt-2 text-passive2">{request.comment}</p>}
            {request.resolution_comment && (
              <p className="t1 mt-2 text-failure">{request.resolution_comment}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              {request.created_at && (
                <p className="t2 text-passive1">{formatDate(request.created_at, i18n.language)}</p>
              )}
              {request.status === WithdrawalStatus.PENDING && (
                <Button
                  variant="tertiary"
                  size="sm"
                  className="text-failure"
                  disabled={cancel.isPending}
                  onClick={() => cancel.mutate({ path: { request_id: request.id } })}
                >
                  {t('withdrawal.cancel')}
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
