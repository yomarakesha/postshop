import { ArrowLeft, Check, Loader2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { useApproveMutation } from '../model/useApproveMutation'
import { useDeclineMutation } from '../model/useDeclineMutation'
import { useProductQuery } from '../model/useProductQuery'
import { buildFileUrl } from '@/shared/lib/buildFileUrl'
import { formatDate } from '@/shared/lib/formatDate'
import { DiscountType, ProductStatus } from '@/shared/openapi/requests'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'

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
  const approve = useApproveMutation(productId)
  const decline = useDeclineMutation(productId)

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
              onClick={() => decline.mutate()}
              isLoading={decline.isPending}
              disabled={isBusy}
            >
              <X className="size-4" />
              {t('moderation.decline')}
            </Button>
            <Button
              type="button"
              onClick={() => approve.mutate()}
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
          <p className="text-sm tabular-nums">{product.shop_base_id}</p>
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
  )
}
