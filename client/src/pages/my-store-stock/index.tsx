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
import { SET, StockModal } from '#/widgets/StockModal'
import { ShopStockList } from '#/widgets/ShopStockList'

/** Приход живёт в «Приёме товара»; здесь — сверка полки и возврат поставщику. */
const STOCK_MODES: ReadonlyArray<StockMode> = [SET, OperationType.RETURN_TO_SUPPLIER]

/**
 * «Остатки» магазина FBS: сколько каждого товара доступно к продаже, и
 * исправление, если на полке оказалось иначе.
 *
 * Только FBS: такой магазин хранит товар сам и сам ведёт его учёт. У магазина
 * FBO товар лежит на складе Postshop — его остатки в разделе «Склад».
 */
export const StoreStockPage = () => {
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
        <h1 className="p1 font-bold">{t('stock.title')}</h1>
        <p className="p3 mt-2 text-passive2">{t('stock.fbsOnly')}</p>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="rounded-base bg-white p-4 shadow-base">
        <h1 className="p1 font-bold">{t('stock.title')}</h1>
        <p className="t1 mt-1 text-passive2">{t('stock.subtitle')}</p>
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
            {t('stock.edit')}
          </Button>
        )}
      />

      <StockModal
        ref={modalRef}
        shopId={shopId}
        target={target}
        modes={STOCK_MODES}
        onDone={refresh}
      />
    </div>
  )
}
