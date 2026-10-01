import { useMutationState } from '@tanstack/react-query'
import { Check, Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { useApproveMutation } from '../model/useApproveMutation'
import { useDeclineMutation } from '../model/useDeclineMutation'
import { useModerationQueueQuery } from '../model/useModerationQueueQuery'
import { moderatedProductId } from '@/shared/hooks/useModerateProductMutation'
import type { ModerateProductVars } from '@/shared/hooks/useModerateProductMutation'
import { formatDate } from '@/shared/lib/formatDate'
import { productModerationKeys } from '@/shared/lib/productModeration'
import type { ModerationDecision } from '@/shared/lib/productModeration'
import { ProductStatus } from '@/shared/openapi/requests'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { DeclineProductDialog } from '@/widgets/DeclineProductDialog'

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

  // Занятость строки считалась по approve.variables — это только последний
  // вызов: одобрив товар А и сразу товар Б, модератор снова получал активные
  // кнопки у А, пока тот ещё не записан. Здесь — все идущие решения разом.
  // Мутация остаётся pending и на время перезапроса очереди (onSettled
  // возвращает промис), так что кнопки не оживают раньше нового статуса.
  const busy = useMutationState({
    filters: { mutationKey: productModerationKeys.decideAll, status: 'pending' },
    select: (mutation) => ({
      productId: moderatedProductId(mutation.state.variables as ModerateProductVars),
      decision: mutation.options.mutationKey?.[2] as ModerationDecision,
    }),
  })
  const busyWith = (productId: number, decision: ModerationDecision) =>
    busy.some((entry) => entry.productId === productId && entry.decision === decision)

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
                const isApproving = busyWith(product.id, 'approved')
                const isDeclining = busyWith(product.id, 'declined')
                const isBusy = isApproving || isDeclining

                return (
                  <TableRow
                    key={product.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/product-moderation/${product.id}`)}
                  >
                    <TableCell className="tabular-nums">{product.id}</TableCell>
                    <TableCell className="font-medium">{name}</TableCell>
                    {/* Показывался голый shop_base_id: модератор видел «12» и
                      не понимал, чей это товар. */}
                    <TableCell className="text-muted-foreground">
                      {product.shop_name ?? `#${product.shop_base_id}`}
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
                            isLoading={isDeclining}
                            disabled={isBusy}
                          >
                            <X className="size-3.5" />
                            {t('moderation.decline')}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => approve.mutate(product.id)}
                            isLoading={isApproving}
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

      <DeclineProductDialog
        open={declineId !== null}
        onOpenChange={(open) => !open && setDeclineId(null)}
        busy={decline.isPending}
        onConfirm={(comment) => {
          if (declineId !== null) decline.mutate({ productId: declineId, comment })
          setDeclineId(null)
        }}
      />
    </>
  )
}
