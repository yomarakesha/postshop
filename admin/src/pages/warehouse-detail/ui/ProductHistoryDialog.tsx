import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { formatDate } from '@/shared/lib/formatDate'
import { getWarehouseProductStockWarehouseOperationsWarehouseWarehouseIdProductProductIdGet } from '@/shared/openapi/requests'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

interface Props {
  warehouseId: number
  productId: number | null
  productName: string
  onClose: () => void
}

/** Приход и возвраты увеличивают остаток, остальное — уменьшает. */
const INCOMING = new Set(['income', 'return_from_customer'])

/**
 * История движений товара на складе: приход, продажи, возвраты, списания.
 *
 * Страница склада показывала только итоговое число — откуда оно взялось,
 * узнать было негде. Метод на сервере был, экрана не было.
 */
export function ProductHistoryDialog({ warehouseId, productId, productName, onClose }: Props) {
  const { t } = useTranslation()

  const { data, isLoading } = useQuery({
    queryKey: ['warehouse-balances', warehouseId, 'history', productId],
    queryFn: () =>
      getWarehouseProductStockWarehouseOperationsWarehouseWarehouseIdProductProductIdGet({
        path: { warehouse_id: warehouseId, product_id: productId! },
        throwOnError: true,
      }),
    enabled: productId !== null,
  })
  // Новые сверху: смотрят обычно последние движения.
  const operations = [...(data?.data.operations ?? [])].reverse()

  return (
    <Dialog open={productId !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('warehouses.historyTitle', { product: productName })}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>{t('fields.createdAt')}</TableHead>
                  <TableHead>{t('warehouses.operation')}</TableHead>
                  <TableHead className="text-right">{t('warehouses.productQuantity')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operations.map((op) => {
                  const incoming = INCOMING.has(op.operation_type)
                  return (
                    <TableRow key={op.id}>
                      <TableCell className="tabular-nums text-muted-foreground">
                        {formatDate(op.created_at)}
                      </TableCell>
                      <TableCell>{t(`warehouses.op.${op.operation_type}`)}</TableCell>
                      <TableCell
                        className={`text-right tabular-nums ${incoming ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {incoming ? '+' : '−'}
                        {op.quantity} {op.measure_unit.code}
                      </TableCell>
                    </TableRow>
                  )
                })}
                {operations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                      {t('noResults')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
