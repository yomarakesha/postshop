import { useRef, useState } from 'react'
import { Link, useParams, useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { WithdrawalModal } from './ui/WithdrawalModal'
import { WithdrawalList } from './ui/WithdrawalList'
import type { StockHistoryTarget } from '#/widgets/StockHistoryModal'
import type { ModalRef } from '#/shared/ui/Modal'
import type { WithdrawalTarget } from './ui/WithdrawalModal'
import { WarehouseType } from '#/shared/openapi/requests'
import { useShopAdditional } from '#/shared/hooks/useShopAdditional'
import { Spinner } from '#/shared/ui/Spinner'
import { cn } from '#/shared/utils/cn'
import { ShopStockList } from '#/widgets/ShopStockList'
import { StockHistoryModal } from '#/widgets/StockHistoryModal'
import { Button } from '#/shared/ui/Button'
import { StoreReceiptsPage } from '#/pages/my-store-receipts'

export type WarehouseTab = 'stock' | 'shipments' | 'withdrawals'

/**
 * «Склад» магазина FBO — всё, что связано со складом Postshop, в одном месте:
 * сколько товара там лежит и документы отправки товара туда.
 *
 * Только FBO. Магазин FBS хранит товар сам: у него «Остатки» и «Приём товара».
 */
export const StoreWarehousePage = () => {
  const { t } = useTranslation()
  const { storeId } = useParams({ from: '/my-store/$storeId' })
  const { tab } = useSearch({ from: '/my-store/$storeId/warehouse' })
  const shopId = Number(storeId)

  const { data: additional, isLoading } = useShopAdditional(shopId)
  const historyRef = useRef<ModalRef>(null)
  const [historyTarget, setHistoryTarget] = useState<StockHistoryTarget | null>(null)
  const withdrawalRef = useRef<ModalRef>(null)
  const [withdrawalTarget, setWithdrawalTarget] = useState<WithdrawalTarget | null>(null)

  if (isLoading) return <Spinner />

  if (additional?.warehouse_type !== WarehouseType.FBO) {
    return (
      <div className="w-full rounded-base bg-white p-6 shadow-base">
        <h1 className="p1 font-bold">{t('warehouse.title')}</h1>
        <p className="p3 mt-2 text-passive2">{t('warehouse.fboOnly')}</p>
      </div>
    )
  }

  const tabs: ReadonlyArray<{ key: WarehouseTab; label: string }> = [
    { key: 'stock', label: t('warehouse.tabStock') },
    { key: 'shipments', label: t('warehouse.tabShipments') },
    { key: 'withdrawals', label: t('warehouse.tabWithdrawals') },
  ]

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-base bg-white p-4 shadow-base">
        <div>
          <h1 className="p1 font-bold">{t('warehouse.title')}</h1>
          <p className="t1 mt-1 text-passive2">{t('warehouse.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {tabs.map((item) => (
            <Link
              key={item.key}
              to="/my-store/$storeId/warehouse"
              params={{ storeId }}
              search={{ tab: item.key }}
              className={cn(
                'p3 rounded-base px-4 py-2 font-medium transition-colors',
                tab === item.key ? 'bg-blue-main text-white' : 'bg-gray2 hover:bg-blue2',
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {tab === 'stock' ? (
        <>
          <p className="t1 px-1 text-passive2">{t('stock.fboSubtitle')}</p>
          {/* Списания брака и возврат товара платформой продавец раньше не
              видел вовсе — только итоговое число. */}
          <ShopStockList
            shopId={shopId}
            action={(row) => (
              <div className="flex gap-2">
                <Button
                  variant="tertiary"
                  size="sm"
                  onClick={() => {
                    setHistoryTarget({ productId: row.productId, name: row.name })
                    historyRef.current?.open()
                  }}
                >
                  {t('stockHistory.open')}
                </Button>
                {/* Забрать свой товар со склада — раньше этого нельзя было
                    попросить вовсе. */}
                {row.available > 0 && (
                  <Button
                    variant="tertiary"
                    size="sm"
                    onClick={() => {
                      setWithdrawalTarget({
                        productId: row.productId,
                        name: row.name,
                        available: row.available,
                      })
                      withdrawalRef.current?.open()
                    }}
                  >
                    {t('withdrawal.action')}
                  </Button>
                )}
              </div>
            )}
          />
          <StockHistoryModal ref={historyRef} shopId={shopId} target={historyTarget} isFbo />
          <WithdrawalModal
            ref={withdrawalRef}
            shopId={shopId}
            target={withdrawalTarget}
            onDone={() => setWithdrawalTarget(null)}
          />
        </>
      ) : tab === 'withdrawals' ? (
        <WithdrawalList shopId={shopId} />
      ) : (
        <StoreReceiptsPage />
      )}
    </div>
  )
}
