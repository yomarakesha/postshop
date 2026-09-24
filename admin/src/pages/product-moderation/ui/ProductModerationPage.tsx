import { Check, Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { useApproveMutation } from '../model/useApproveMutation'
import { useDeclineMutation } from '../model/useDeclineMutation'
import { useModerationQueueQuery } from '../model/useModerationQueueQuery'
import { formatDate } from '@/shared/lib/formatDate'
import { ProductStatus } from '@/shared/openapi/requests'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

const statusVariant = {
  [ProductStatus.PENDING]: 'warning',
  [ProductStatus.APPROVED]: 'success',
  [ProductStatus.DECLINED]: 'destructive',
} as const

export function ProductModerationPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, isLoading } = useModerationQueueQuery()
  const approve = useApproveMutation()
  const decline = useDeclineMutation()
  const [declineId, setDeclineId] = useState<number | null>(null)

  const products = data?.data ?? []

  return (
    <>
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead>ID</TableHead>
              <TableHead>{t('fields.name')}</TableHead>
              <TableHead>{t('moderation.shopId')}</TableHead>
              <TableHead>{t('moderation.price')}</TableHead>
              <TableHead>{t('fields.status')}</TableHead>
              <TableHead>{t('fields.createdAt')}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : products.length > 0 ? (
              products.map((product) => {
                const name =
                  product.translations.find((tr) => tr.language === 'ru')?.name ??
                  product.translations[0]?.name ??
                  '—'
                const isPending = product.status === ProductStatus.PENDING
                const isBusy =
                  (approve.isPending && approve.variables === product.id) ||
                  (decline.isPending && decline.variables === product.id)

                return (
                  <TableRow
                    key={product.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/product-moderation/${product.id}`)}
                  >
                    <TableCell className="tabular-nums">{product.id}</TableCell>
                    <TableCell className="font-medium">{name}</TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {product.shop_base_id}
                    </TableCell>
                    <TableCell className="tabular-nums">{product.price}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[product.status]}>
                        {t(`productStatus.${product.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {formatDate(product.created_at)}
                    </TableCell>
                    <TableCell>
                      {isPending && (
                        <div
                          className="flex items-center justify-end gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Отклонение шло прямо из строки таблицы одним
                            кликом, без вопроса и без указания причины. */}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeclineId(product.id)}
                            isLoading={isBusy && decline.isPending}
                            disabled={isBusy}
                          >
                            <X className="size-3.5" />
                            {t('moderation.decline')}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => approve.mutate(product.id)}
                            isLoading={isBusy && approve.isPending}
                            disabled={isBusy}
                          >
                            <Check className="size-3.5" />
                            {t('moderation.approve')}
                          </Button>
                        </div>
                      )}
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

      <ConfirmDialog
        open={declineId !== null}
        onOpenChange={(open) => !open && setDeclineId(null)}
        title={t('confirm.declineProductTitle')}
        description={t('confirm.declineProductText')}
        confirmLabel={t('moderation.decline')}
        destructive
        busy={decline.isPending}
        onConfirm={() => {
          if (declineId !== null) decline.mutate(declineId)
          setDeclineId(null)
        }}
      />
    </>
  )
}
