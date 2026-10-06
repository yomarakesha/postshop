import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { ModalRef } from '#/shared/ui/Modal'
import {
  useGetProductStockStockOperationsProductIdGet,
  useGetShopProductHistoryWarehouseOperationsShopShopIdProductProductIdGet,
} from '#/shared/openapi/queries'
import { Modal } from '#/shared/ui/Modal'
import { Spinner } from '#/shared/ui/Spinner'
import { cn } from '#/shared/utils/cn'
import { formatNumericDateTime } from '#/shared/utils/formatDate'

export interface StockHistoryTarget {
  productId: number
  name: string
}

interface Props {
  shopId: number
  target: StockHistoryTarget | null
  /** FBO — движения по складам Postshop, FBS — журнал самого магазина. */
  isFbo: boolean
}

/** Эти операции увеличивают остаток; пересчёт несёт знак в самом количестве. */
const INCOMING = new Set(['income', 'return_from_customer'])

interface Row {
  id: number
  operation_type: string
  quantity: string
  created_at: Date | string
  measure_unit: { code: string }
}

/**
 * История движений товара: приход, продажи, возвраты, пересчёты, списания.
 *
 * Продавец видел только итоговое число — откуда оно взялось, узнать было
 * негде. У FBO к тому же платформа списывает брак и возвращает товар, и об
 * этом продавец не знал вовсе.
 */
export const StockHistoryModal = forwardRef<ModalRef, Props>(({ shopId, target, isFbo }, ref) => {
  const { t } = useTranslation()
  const productId = target?.productId ?? 0

  const fbs = useGetProductStockStockOperationsProductIdGet(
    { path: { product_id: productId } },
    undefined,
    { enabled: target !== null && !isFbo },
  )
  const fbo = useGetShopProductHistoryWarehouseOperationsShopShopIdProductProductIdGet(
    { path: { shop_id: shopId, product_id: productId } },
    undefined,
    { enabled: target !== null && isFbo },
  )
  const query = isFbo ? fbo : fbs
  // Журнал FBS приходит по возрастанию, склад — по убыванию; показываем новые сверху.
  const rows: Array<Row> = isFbo
    ? (fbo.data?.operations ?? [])
    : [...(fbs.data?.operations ?? [])].reverse()

  const sign = (row: Row) => {
    if (row.operation_type === 'correction') return Number(row.quantity) >= 0 ? '+' : ''
    return INCOMING.has(row.operation_type) ? '+' : '−'
  }
  const isPlus = (row: Row) =>
    row.operation_type === 'correction'
      ? Number(row.quantity) >= 0
      : INCOMING.has(row.operation_type)

  return (
    <Modal ref={ref} className="w-full max-w-120">
      <div className="flex flex-col gap-3 p-6">
        <h2 className="p1 font-bold">{t('stockHistory.title')}</h2>
        {target && <p className="p3 text-passive2">{target.name}</p>}

        {query.isLoading && <Spinner />}
        {!query.isLoading && rows.length === 0 && (
          <p className="t1 text-passive2">{t('stockHistory.empty')}</p>
        )}

        <ul className="flex max-h-[60vh] flex-col divide-y divide-stroke overflow-y-auto">
          {rows.map((row) => (
            <li key={row.id} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <p className="p3">{t(`stockHistory.op.${row.operation_type}`)}</p>
                <p className="t2 text-passive2">{formatNumericDateTime(row.created_at)}</p>
              </div>
              <p
                className={cn(
                  'p3 shrink-0 font-semibold tabular-nums',
                  isPlus(row) ? 'text-success' : 'text-failure',
                )}
              >
                {sign(row)}
                {Number(row.quantity)} {row.measure_unit.code}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  )
})

StockHistoryModal.displayName = 'StockHistoryModal'
