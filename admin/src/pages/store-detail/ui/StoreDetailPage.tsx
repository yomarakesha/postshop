import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Store,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { useChangeWarehouseTypeMutation } from '../model/useChangeWarehouseTypeMutation'
import { useStoreDetailQuery } from '../model/useStoreDetailQuery'
import { useStoreProductsQuery, STORE_PRODUCTS_PAGE_SIZE } from '../model/useStoreProductsQuery'
import { useToggleShopBlockMutation } from '../model/useToggleShopBlockMutation'
import { useFeatures } from '@/shared/hooks/useFeatures'
import { getErrorMessage } from '@/shared/lib/apiError'
import { buildFileUrl } from '@/shared/lib/buildFileUrl'
import { formatDate } from '@/shared/lib/formatDate'
import {
  getUserUsersUserIdGet,
  ProductStatus,
  RegistrationStatus,
  WarehouseType,
} from '@/shared/openapi/requests'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { Label } from '@/shared/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { ShopDocuments } from '@/widgets/ShopDocuments'

const registrationStatusVariant = {
  [RegistrationStatus.PENDING]: 'warning',
  [RegistrationStatus.APPROVED]: 'success',
  [RegistrationStatus.REJECTED]: 'destructive',
  [RegistrationStatus.SUSPENDED]: 'default',
} as const

const productStatusVariant = {
  [ProductStatus.PENDING]: 'warning',
  [ProductStatus.APPROVED]: 'success',
  [ProductStatus.DECLINED]: 'destructive',
} as const

export function StoreDetailPage() {
  const { id } = useParams<{ id: string }>()
  const shopId = Number(id)
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [productsPage, setProductsPage] = useState(0)

  const { data: shop, isLoading } = useStoreDetailQuery(shopId)
  const toggleBlock = useToggleShopBlockMutation(shopId)
  const [askBlock, setAskBlock] = useState(false)
  const { fboEnabled } = useFeatures()
  const changeWarehouseType = useChangeWarehouseTypeMutation()
  const [askWarehouseType, setAskWarehouseType] = useState(false)
  const { data: productsData, isLoading: productsLoading } = useStoreProductsQuery(
    shopId,
    productsPage,
  )

  const ownerId = shop?.owner_id
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['users', ownerId],
    queryFn: () =>
      getUserUsersUserIdGet({
        path: { user_id: ownerId! },
        throwOnError: true,
      }),
    enabled: ownerId != null,
  })

  if (isLoading || (shop && userLoading)) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!shop) return null

  const user = userData?.data
  const additional = shop.additional
  const currentType = additional?.warehouse_type
  const nextType = currentType === WarehouseType.FBS ? WarehouseType.FBO : WarehouseType.FBS
  // На FBO переводить нельзя, пока платформа товар не хранит; обратно на FBS —
  // можно всегда: это и есть выход для магазинов FBO при выключенном складе.
  const canChangeType = !!additional && (nextType === WarehouseType.FBS || fboEnabled)
  const products = productsData?.data ?? []
  const hasNextPage = products.length === STORE_PRODUCTS_PAGE_SIZE

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={() => navigate('/stores')}>
          <ArrowLeft className="size-4" />
          {t('back')}
        </Button>

        {/* Блокировка уводила витрину магазина офлайн одним кликом без вопроса. */}
        <Button
          type="button"
          variant={shop.is_active ? 'destructive' : 'default'}
          onClick={() => (shop.is_active ? setAskBlock(true) : toggleBlock.mutate(shop.is_active))}
          isLoading={toggleBlock.isPending}
        >
          {shop.is_active ? (
            <>
              <Ban className="size-4" />
              {t('stores.block')}
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4" />
              {t('stores.unblock')}
            </>
          )}
        </Button>
      </div>

      <div className="flex items-center gap-4 rounded-xl border px-5 py-5">
        <div
          className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted"
          style={additional?.color ? { backgroundColor: additional.color } : undefined}
        >
          {additional?.logo_path ? (
            <img
              src={buildFileUrl(additional.logo_path)}
              alt={additional?.name ?? ''}
              className="size-full object-cover"
            />
          ) : (
            <Store className="size-6 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-lg font-semibold">{additional?.name ?? '—'}</p>
          {additional?.description ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">{additional.description}</p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-xl border px-5 py-5">
        <div className="space-y-1.5">
          <Label>{t('fields.fullName')}</Label>
          <p className="text-sm font-medium">
            {user?.name ?? '—'} {user?.surname ?? ''}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label>{t('fields.phone')}</Label>
          <p className="text-sm">{user?.phone ?? '—'}</p>
        </div>

        <div className="space-y-1.5">
          <Label>{t('becomeStoreRequests.legalEntityType')}</Label>
          <p className="text-sm">{t(shop.legal_entity_type)}</p>
        </div>

        <div className="space-y-1.5">
          <Label>{t('stores.warehouseType')}</Label>
          <div className="flex items-center gap-3">
            <p className="text-sm">{currentType ? t(`warehouseType.${currentType}`) : '—'}</p>
            {currentType && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canChangeType}
                title={canChangeType ? undefined : t('stores.fboDisabledHint')}
                onClick={() => setAskWarehouseType(true)}
              >
                {t('stores.changeWarehouseType')}
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>{t('becomeStoreRequests.registrationStatus')}</Label>
          <div>
            <Badge variant={registrationStatusVariant[shop.registration_status]}>
              {t(`registrationStatus.${shop.registration_status}`)}
            </Badge>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>{t('fields.status')}</Label>
          <div>
            <Badge variant={shop.is_active ? 'success' : 'destructive'}>
              {shop.is_active ? t('active') : t('blocked')}
            </Badge>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>{t('fields.createdAt')}</Label>
          <p className="text-sm tabular-nums">{formatDate(shop.created_at)}</p>
        </div>

        <div className="space-y-1.5">
          <Label>{t('becomeStoreRequests.updatedAt')}</Label>
          <p className="text-sm tabular-nums">
            {shop.updated_at ? formatDate(shop.updated_at) : '—'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-xl border px-5 py-5">
        <div className="space-y-1.5">
          <Label>{t('stores.addresses')}</Label>
          {additional?.addresses && additional.addresses.length > 0 ? (
            <ul className="space-y-1">
              {additional.addresses.map((address) => (
                <li key={address} className="text-sm">
                  {address}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">—</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>{t('stores.phoneNumbers')}</Label>
          {additional?.phone_numbers && additional.phone_numbers.length > 0 ? (
            <ul className="space-y-1">
              {additional.phone_numbers.map((phone) => (
                <li key={phone} className="text-sm tabular-nums">
                  {phone}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">—</p>
          )}
        </div>
      </div>

      <ShopDocuments
        shopId={shopId}
        legalEntityType={shop.legal_entity_type}
        documents={shop.documents}
      />

      <div className="space-y-3 rounded-xl border px-5 py-5">
        <Label className="text-base">{t('stores.products')}</Label>
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead>ID</TableHead>
                <TableHead>{t('fields.name')}</TableHead>
                <TableHead>{t('moderation.price')}</TableHead>
                <TableHead>{t('fields.status')}</TableHead>
                <TableHead>{t('fields.createdAt')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productsLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : products.length > 0 ? (
                products.map((product) => {
                  const name =
                    product.translations.find((tr) => tr.language === 'ru')?.name ??
                    product.translations[0]?.name ??
                    '—'
                  const image = product.images?.[0]
                  return (
                    <TableRow
                      key={product.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/product-moderation/${product.id}`)}
                    >
                      <TableCell className="tabular-nums">{product.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {image ? (
                            <img
                              src={buildFileUrl(image)}
                              alt={name}
                              className="size-9 shrink-0 rounded-md border object-cover"
                            />
                          ) : (
                            <div className="size-9 shrink-0 rounded-md border bg-muted" />
                          )}
                          <span className="font-medium">{name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="tabular-nums">{product.price}</TableCell>
                      <TableCell>
                        <Badge variant={productStatusVariant[product.status]}>
                          {t(`productStatus.${product.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">
                        {formatDate(product.created_at)}
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    {t('stores.noProducts')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setProductsPage((p) => p - 1)}
            disabled={productsPage === 0 || productsLoading}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm tabular-nums text-muted-foreground">{productsPage + 1}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setProductsPage((p) => p + 1)}
            disabled={!hasNextPage || productsLoading}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
      <ConfirmDialog
        open={askWarehouseType}
        onOpenChange={setAskWarehouseType}
        title={t('stores.changeWarehouseTypeTitle', { type: t(`warehouseType.${nextType}`) })}
        description={nextType === WarehouseType.FBS ? t('stores.toFbsText') : t('stores.toFboText')}
        busy={changeWarehouseType.isPending}
        onConfirm={() => {
          if (!additional) return
          changeWarehouseType.mutate(
            { shopAdditionalId: additional.id, warehouseType: nextType },
            {
              onSuccess: () => {
                toast.success(t('stores.warehouseTypeChanged'))
                setAskWarehouseType(false)
              },
              onError: (error) => toast.error(getErrorMessage(error)),
            },
          )
        }}
      />

      <ConfirmDialog
        open={askBlock}
        onOpenChange={setAskBlock}
        title={t('confirm.blockShopTitle')}
        description={t('confirm.blockShopText')}
        confirmLabel={t('stores.block')}
        destructive
        busy={toggleBlock.isPending}
        onConfirm={() => toggleBlock.mutate(shop.is_active)}
      />
    </div>
  )
}
