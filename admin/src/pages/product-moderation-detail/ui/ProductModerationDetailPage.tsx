import { ArrowLeft, Check, Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { useApproveMutation } from '../model/useApproveMutation'
import { useDeclineMutation } from '../model/useDeclineMutation'
import { useProductQuery } from '../model/useProductQuery'
import { useProductSaleMutation } from '../model/useProductSaleMutation'
import { buildFileUrl } from '@/shared/lib/buildFileUrl'
import { formatDate } from '@/shared/lib/formatDate'
import { DiscountType, ProductStatus } from '@/shared/openapi/requests'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { Label } from '@/shared/ui/label'
import { DeclineProductDialog } from '@/widgets/DeclineProductDialog'

const statusVariant = {
  [ProductStatus.PENDING]: 'warning',
  [ProductStatus.APPROVED]: 'success',
  [ProductStatus.DECLINED]: 'destructive',
} as const

export function ProductModerationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const productId = Number(id)
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data, isLoading } = useProductQuery(productId)
  const approve = useApproveMutation()
  const decline = useDeclineMutation()
  // Отклонение из карточки уходило одним кликом, без вопроса и без причины —
  // в отличие от очереди. Теперь тот же диалог, что и в списке.
  const [askDecline, setAskDecline] = useState(false)
  const sale = useProductSaleMutation(productId)
  const [askBlock, setAskBlock] = useState(false)

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const product = data?.data
  if (!product) return null

  const isPending = product.status === ProductStatus.PENDING
  const isBusy = approve.isPending || decline.isPending

  const discountLabel =
    product.discount != null && product.discount_type != null
      ? product.discount_type === DiscountType.PERCENTAGE
        ? `${product.discount}%`
        : product.discount
      : null

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" onClick={() => navigate('/product-moderation')}>
            <ArrowLeft className="size-4" />
            {t('back')}
          </Button>

          {isPending && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setAskDecline(true)}
                isLoading={decline.isPending}
                disabled={isBusy}
              >
                <X className="size-4" />
                {t('moderation.decline')}
              </Button>
              <Button
                type="button"
                onClick={() => approve.mutate(productId)}
                isLoading={approve.isPending}
                disabled={isBusy}
              >
                <Check className="size-4" />
                {t('moderation.approve')}
              </Button>
            </div>
          )}
        </div>

        {(() => {
          const tr = product.translations[0]
          if (!tr) return null
          return (
            <div className="grid grid-cols-2 gap-4 rounded-xl border px-5 py-5">
              <div className="space-y-1.5">
                <Label>{t('fields.name')}</Label>
                <p className="text-sm font-medium">{tr.name}</p>
              </div>
              <div className="space-y-1.5">
                <Label>{t('moderation.description')}</Label>
                <p className="text-sm text-muted-foreground">{tr.description || '—'}</p>
              </div>
            </div>
          )
        })()}

        {/* В продаже товар или нет — отдельно от модерации: одобренный товар
            может снять продавец или платформа. Раньше снять его из админки
            было негде. */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-5 py-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{t('products.sale.title')}</p>
            <Badge
              variant={
                product.is_active ? 'success' : product.blocked_by_staff ? 'destructive' : 'default'
              }
            >
              {product.is_active
                ? t('products.sale.active')
                : product.blocked_by_staff
                  ? t('products.sale.blockedByStaff')
                  : t('products.sale.hiddenByOwner')}
            </Badge>
          </div>
          {product.is_active || !product.blocked_by_staff ? (
            <Button
              variant="destructive"
              disabled={sale.isPending}
              onClick={() => setAskBlock(true)}
            >
              {t('products.sale.block')}
            </Button>
          ) : (
            <Button
              disabled={sale.isPending}
              isLoading={sale.isPending}
              onClick={() => sale.mutate(true)}
            >
              {t('products.sale.unblock')}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-xl border px-5 py-5">
          <div className="space-y-1.5">
            <Label>{t('fields.status')}</Label>
            <div>
              <Badge variant={statusVariant[product.status]}>
                {t(`productStatus.${product.status}`)}
              </Badge>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t('moderation.shopId')}</Label>
            <p className="text-sm">{product.shop_name ?? `#${product.shop_base_id}`}</p>
          </div>

          <div className="space-y-1.5">
            <Label>{t('moderation.price')}</Label>
            <p className="text-sm tabular-nums">{product.price}</p>
          </div>

          {discountLabel && (
            <div className="space-y-1.5">
              <Label>{t('moderation.discount')}</Label>
              <p className="text-sm tabular-nums">{discountLabel}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>{t('moderation.measureUnit')}</Label>
            <p className="text-sm">{product.measure_unit.code}</p>
          </div>

          {product.brand && (
            <div className="space-y-1.5">
              <Label>{t('moderation.brand')}</Label>
              <p className="text-sm">{product.brand.name}</p>
            </div>
          )}

          {product.hashtag && (
            <div className="space-y-1.5">
              <Label>{t('moderation.hashtag')}</Label>
              <p className="text-sm">{product.hashtag}</p>
            </div>
          )}

          {/* Штрихкодов на карточке не было, и сверить заводской код продавца
          с упаковкой на фото модератор не мог. Штрихкод Postshop выдаётся
          платформой всегда, заводской — только если продавец его указал. */}
          {product.barcode && (
            <div className="space-y-1.5">
              <Label>{t('moderation.barcode')}</Label>
              <p className="font-mono text-sm tabular-nums">{product.barcode}</p>
            </div>
          )}

          {product.vendor_barcode && (
            <div className="space-y-1.5">
              <Label>{t('moderation.vendorBarcode')}</Label>
              <p className="font-mono text-sm tabular-nums">{product.vendor_barcode}</p>
            </div>
          )}

          {product.moderation_comment && (
            <div className="col-span-2 space-y-1.5">
              <Label>{t('moderation.moderationComment')}</Label>
              <p className="text-sm text-muted-foreground">{product.moderation_comment}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>{t('fields.createdAt')}</Label>
            <p className="text-sm tabular-nums">{formatDate(product.created_at)}</p>
          </div>

          {product.updated_at && (
            <div className="space-y-1.5">
              <Label>{t('moderation.updatedAt')}</Label>
              <p className="text-sm tabular-nums">{formatDate(product.updated_at)}</p>
            </div>
          )}
        </div>

        {product.images && product.images.length > 0 && (
          <div className="space-y-3 rounded-xl border px-5 py-5">
            <Label className="text-base">{t('moderation.images')}</Label>
            <div className="flex flex-wrap gap-3">
              {product.images.map((img) => (
                <a key={img} href={buildFileUrl(img)} target="_blank" rel="noreferrer">
                  <img
                    src={buildFileUrl(img)}
                    alt=""
                    className="size-28 rounded-lg border object-cover transition-opacity hover:opacity-80"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      <DeclineProductDialog
        open={askDecline}
        onOpenChange={setAskDecline}
        busy={decline.isPending}
        onConfirm={(comment) => decline.mutate({ productId, comment })}
      />
      <ConfirmDialog
        open={askBlock}
        onOpenChange={setAskBlock}
        title={t('products.sale.blockTitle')}
        description={t('products.sale.blockText')}
        confirmLabel={t('products.sale.block')}
        destructive
        busy={sale.isPending}
        onConfirm={() => sale.mutate(false, { onSuccess: () => setAskBlock(false) })}
      />
    </>
  )
}
