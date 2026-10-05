import { ArrowLeft, Check, Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { useConfirmReceiptMutation } from '../model/useConfirmReceiptMutation'
import { useCancelReceiptMutation, useUpdateReceiptItemMutation } from '../model/useReceiptActions'
import { useStockReceiptQuery } from '../model/useStockReceiptQuery'
import { formatDate } from '@/shared/lib/formatDate'
import { receiptStatusVariant } from '@/shared/lib/receiptStatus'
import { ReceiptStatus } from '@/shared/openapi/requests'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { Input } from '@/shared/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

export function GoodsReceivingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const receiptId = Number(id)
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data, isLoading } = useStockReceiptQuery(receiptId)
  const receipt = data?.data

  const confirmReceipt = useConfirmReceiptMutation()
  const [askConfirm, setAskConfirm] = useState(false)
  const cancelReceipt = useCancelReceiptMutation()
  const [askCancel, setAskCancel] = useState(false)
  const updateItem = useUpdateReceiptItemMutation(receiptId)
  // Правка количества: какая позиция редактируется и введённое значение.
  const [editing, setEditing] = useState<{ itemId: number; value: string } | null>(null)

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!receipt) return null

  const totalQuantity = receipt.items.reduce((sum, item) => sum + Number(item.quantity), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => navigate('/goods-receiving')}>
          <ArrowLeft className="size-4" />
        </Button>
        <h2 className="text-lg font-semibold">{t('goodsReceiving.detailTitle', { id })}</h2>
        <Badge variant={receiptStatusVariant[receipt.status]}>
          {t(`goodsReceiving.status.${receipt.status}`)}
        </Badge>

        {/* Подтверждать можно только черновик: подтверждённый уже завёл
            остаток, отменённый закрыт продавцом. Раньше кнопки не было вовсе,
            и документ продавца висел черновиком навсегда. */}
        {receipt.status === ReceiptStatus.DRAFT && (
          <div className="ml-auto flex gap-2">
            {/* Магазин не привёз товар — черновик раньше было некуда деть. */}
            <Button
              variant="outline"
              disabled={cancelReceipt.isPending || confirmReceipt.isPending}
              onClick={() => setAskCancel(true)}
            >
              <X className="size-4" />
              {t('goodsReceiving.cancel')}
            </Button>
            <Button
              disabled={receipt.items.length === 0 || confirmReceipt.isPending}
              isLoading={confirmReceipt.isPending}
              onClick={() => setAskConfirm(true)}
            >
              <Check className="size-4" />
              {t('goodsReceiving.confirm')}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-xl border px-5 py-5 sm:grid-cols-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{t('goodsReceiving.warehouse')}</p>
          <p className="text-sm font-medium">
            {receipt.warehouse_name ?? `#${receipt.warehouse_id}`}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{t('goodsReceiving.store')}</p>
          <p className="text-sm font-medium">{receipt.shop_name ?? `#${receipt.shop_id}`}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{t('goodsReceiving.totalQuantity')}</p>
          <p className="text-sm font-medium">{totalQuantity}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{t('fields.createdAt')}</p>
          <p className="text-sm font-medium">{formatDate(receipt.created_at)}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">{t('goodsReceiving.productsList')}</h3>
          <span className="text-sm text-muted-foreground">
            {t('goodsReceiving.productsTotal', { count: receipt.items.length })}
          </span>
        </div>

        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className="w-12">#</TableHead>
                <TableHead>{t('goodsReceiving.productName')}</TableHead>
                <TableHead>{t('goodsReceiving.measureUnit')}</TableHead>
                <TableHead>{t('goodsReceiving.quantity')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipt.items.length > 0 ? (
                receipt.items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.product_name ?? `#${item.product_id}`}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.measure_unit.code}
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {editing?.itemId === item.id ? (
                        <form
                          className="flex items-center gap-2"
                          onSubmit={(e) => {
                            e.preventDefault()
                            const amount = Number(editing.value)
                            if (!Number.isFinite(amount) || amount <= 0) return
                            updateItem.mutate(
                              { itemId: item.id, quantity: editing.value },
                              { onSuccess: () => setEditing(null) },
                            )
                          }}
                        >
                          <Input
                            type="number"
                            min="0"
                            step="0.001"
                            className="h-8 w-28"
                            autoFocus
                            value={editing.value}
                            onChange={(e) => setEditing({ itemId: item.id, value: e.target.value })}
                          />
                          <Button type="submit" size="sm" isLoading={updateItem.isPending}>
                            {t('save')}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditing(null)}
                          >
                            {t('cancel')}
                          </Button>
                        </form>
                      ) : (
                        <div className="flex items-center gap-2">
                          {item.quantity}
                          {/* Привезли не столько, сколько заявили: подтверждается
                              то, что фактически принято. */}
                          {receipt.status === ReceiptStatus.DRAFT && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setEditing({ itemId: item.id, value: String(item.quantity) })
                              }
                            >
                              {t('goodsReceiving.editQuantity')}
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    {t('goodsReceiving.noProducts')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ConfirmDialog
        open={askCancel}
        onOpenChange={setAskCancel}
        title={t('goodsReceiving.cancelTitle')}
        description={t('goodsReceiving.cancelText')}
        confirmLabel={t('goodsReceiving.cancel')}
        destructive
        busy={cancelReceipt.isPending}
        onConfirm={() => {
          cancelReceipt.mutate(receiptId, { onSuccess: () => setAskCancel(false) })
        }}
      />
      <ConfirmDialog
        open={askConfirm}
        onOpenChange={setAskConfirm}
        title={t('goodsReceiving.confirmTitle')}
        description={t('goodsReceiving.confirmText')}
        confirmLabel={t('goodsReceiving.confirm')}
        busy={confirmReceipt.isPending}
        onConfirm={() => {
          confirmReceipt.mutate(receiptId, { onSuccess: () => setAskConfirm(false) })
        }}
      />
    </div>
  )
}
