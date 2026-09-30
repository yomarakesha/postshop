import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type { ModalRef } from '#/shared/ui/Modal'
import type { StockMode, StockTarget } from '#/widgets/StockModal'
import { useGetProductsAvailabilityStockOperationsAvailabilityGetKey } from '#/shared/openapi/queries/common'
import { OperationType, WarehouseType } from '#/shared/openapi/requests'
import { useShopAdditional } from '#/shared/hooks/useShopAdditional'
import { Button } from '#/shared/ui/Button'
import { Spinner } from '#/shared/ui/Spinner'
import { StockModal } from '#/widgets/StockModal'
import { ShopStockList } from '#/widgets/ShopStockList'

const INTAKE_MODES: ReadonlyArray<StockMode> = [OperationType.INCOME]

/**
 * «Приём товара» магазина FBS: продавец отмечает, что к нему пришёл товар, и
 * остаток растёт на это количество.
 *
 * Только FBS. Магазин FBO свой товар не принимает — он отправляет его на склад
 * Postshop, и приход записывает платформа (раздел «Склад»).
 */
export const StoreIntakePage = () => {
  const { t } = useTranslation()
  const { storeId } = useParams({ from: '/my-store/$storeId' })
  const shopId = Number(storeId)
  const queryClient = useQueryClient()
  const modalRef = useRef<ModalRef>(null)
  const [target, setTarget] = useState<StockTarget | null>(null)

  const { data: additional, isLoading } = useShopAdditional(shopId)

  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: [useGetProductsAvailabilityStockOperationsAvailabilityGetKey],
    })

  if (isLoading) return <Spinner />

  if (additional?.warehouse_type !== WarehouseType.FBS) {
    return (
      <div className="w-full rounded-base bg-white p-6 shadow-base">
        <h1 className="p1 font-bold">{t('intake.title')}</h1>
        <p className="p3 mt-2 text-passive2">{t('intake.fbsOnly')}</p>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="rounded-base bg-white p-4 shadow-base">
        <h1 className="p1 font-bold">{t('intake.title')}</h1>
        <p className="t1 mt-1 text-passive2">{t('intake.subtitle')}</p>
      </div>

      <ShopStockList
        shopId={shopId}
        action={(row) => (
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => {
              setTarget(row)
              modalRef.current?.open()
            }}
          >
            {t('intake.accept')}
          </Button>
        )}
      />

      <StockModal
        ref={modalRef}
        shopId={shopId}
        target={target}
        modes={INTAKE_MODES}
        title={t('intake.modalTitle')}
        savedText={t('intake.saved')}
        onDone={refresh}
      />
    </div>
  )
}
