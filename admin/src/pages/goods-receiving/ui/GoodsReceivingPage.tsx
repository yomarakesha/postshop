import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { useStockReceiptsQuery } from '../model/useStockReceiptsQuery'
import { readTotalCount, useListControls } from '@/shared/hooks/useListControls'
import { formatDate } from '@/shared/lib/formatDate'
import { receiptStatusVariant } from '@/shared/lib/receiptStatus'
import { Badge } from '@/shared/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { CreateButton } from '@/widgets/CreateButton'
import { TablePagination } from '@/widgets/TablePagination'

export function GoodsReceivingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Списки грузились одной порцией до 500 записей без страниц: дальше
  // запись было не найти. Теперь — постранично, с общим числом с сервера.
  const { page, setPage, pageSize, skip, limit } = useListControls()
  const { data, isLoading } = useStockReceiptsQuery({ skip, limit })
  const total = readTotalCount(data?.response.headers, data?.data.length ?? 0)
  const receipts = data?.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <CreateButton onClick={() => navigate('/goods-receiving/create')} />
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead className="w-12">#</TableHead>
              <TableHead>{t('goodsReceiving.warehouse')}</TableHead>
              <TableHead>{t('goodsReceiving.store')}</TableHead>
              <TableHead>{t('goodsReceiving.productsCount')}</TableHead>
              <TableHead>{t('goodsReceiving.totalQuantity')}</TableHead>
              <TableHead>{t('fields.status')}</TableHead>
              <TableHead>{t('fields.createdAt')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : receipts.length > 0 ? (
              receipts.map((receipt) => {
                const totalQuantity = receipt.items.reduce(
                  (sum, item) => sum + Number(item.quantity),
                  0,
                )
                return (
                  <TableRow
                    key={receipt.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/goods-receiving/${receipt.id}`)}
                  >
                    <TableCell className="text-muted-foreground tabular-nums">
                      {receipt.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {receipt.warehouse_name ?? `#${receipt.warehouse_id}`}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {receipt.shop_name ?? `#${receipt.shop_id}`}
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {receipt.items.length}
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {totalQuantity}
                    </TableCell>
                    <TableCell>
                      <Badge variant={receiptStatusVariant[receipt.status]}>
                        {t(`goodsReceiving.status.${receipt.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {formatDate(receipt.created_at)}
                    </TableCell>
                  </TableRow>
                )
              })
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
    </div>
  )
}
