import { useForm } from '@tanstack/react-form'
import { ImageIcon, Loader2, Search } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { useCollectionQuery } from '../model/useCollectionQuery'
import { useProductsQuery } from '../model/useProductsQuery'
import { useShopsQuery } from '../model/useShopsQuery'
import { useToggleCollectionStatusMutation } from '../model/useToggleCollectionStatusMutation'
import { useUpdateCollectionMutation } from '../model/useUpdateCollectionMutation'
import { PERMISSION_KEYS } from '@/shared/constants/PermissionKeys'
import { useHasPermission } from '@/shared/hooks/useHasPermission'
import { buildFileUrl } from '@/shared/lib/buildFileUrl'
import { getTranslationName } from '@/shared/lib/getTranslationName'
import type {
  CollectionResponse,
  CollectionTranslationInput,
  CollectionUpdate,
  ProductResponse,
} from '@/shared/openapi/requests'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { ConfirmSwitch } from '@/shared/ui/confirm-dialog'
import { Input } from '@/shared/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/shared/ui/input-group'
import { Label } from '@/shared/ui/label'
import { Form } from '@/widgets/Form'

export function EditCollectionPage() {
  const { id } = useParams<{ id: string }>()
  const collectionId = Number(id)
  const { t, i18n } = useTranslation()
  const { hasPermission } = useHasPermission()
  const canBlock = hasPermission(PERMISSION_KEYS.COLLECTIONS.block)

  const { data, isLoading } = useCollectionQuery(collectionId)
  const { data: productsData } = useProductsQuery()
  const { data: shopsData } = useShopsQuery()
  const mutation = useUpdateCollectionMutation(collectionId)
  const toggleStatus = useToggleCollectionStatusMutation(collectionId)

  const collection = data?.data
  const products = productsData?.data ?? []
  const shopsMap = new Map<number, string>()

  for (const shop of shopsData?.data ?? []) {
    if (shop.additional?.name) {
      shopsMap.set(shop.id, shop.additional.name)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!collection) return null

  return (
    <EditCollectionForm
      isSubmitting={mutation.isPending || toggleStatus.isPending}
      key={collection.id}
      collection={collection}
      products={products}
      shopsMap={shopsMap}
      uiLang={i18n.language}
      canBlock={canBlock}
      onSubmit={(value) => mutation.mutate(value)}
      onToggleStatus={() => toggleStatus.mutate(collection.is_active)}
      t={t}
    />
  )
}

function EditCollectionForm({
  isSubmitting,
  collection,
  products,
  shopsMap,
  uiLang,
  canBlock,
  onSubmit,
  onToggleStatus,
  t,
}: {
  isSubmitting: boolean
  collection: CollectionResponse
  products: ProductResponse[]
  shopsMap: Map<number, string>
  uiLang: string
  canBlock: boolean
  onSubmit: (value: CollectionUpdate) => void
  onToggleStatus: () => void
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  const [productSearch, setProductSearch] = useState('')

  const form = useForm({
    defaultValues: {
      name_en: getTranslationName(collection.translations, 'en'),
      name_ru: getTranslationName(collection.translations, 'ru'),
      name_tk: getTranslationName(collection.translations, 'tk'),
      name_tr: getTranslationName(collection.translations, 'tr'),
      product_ids: collection.products.map((p) => p.id),
    },
    onSubmit: ({ value }) => {
      const translations: CollectionTranslationInput[] = [
        { language: 'ru', name: value.name_ru },
        { language: 'tk', name: value.name_tk },
        { language: 'en', name: value.name_en },
      ]
      if (value.name_tr) translations.push({ language: 'tr', name: value.name_tr })
      onSubmit({ translations, product_ids: value.product_ids })
    },
  })

  const filteredProducts = products.filter((product) => {
    const name =
      getTranslationName(product.translations, uiLang) || product.translations[0]?.name || ''
    return name.toLowerCase().includes(productSearch.toLowerCase())
  })

  return (
    <Form
      isSubmitting={isSubmitting}
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      submitLabel={t('save')}
    >
      <div className="grid grid-cols-2 gap-4 rounded-xl border px-5 py-5">
        <form.Field name="name_ru">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="name_ru">{t('fields.nameRu')}</Label>
              <Input
                id="name_ru"
                placeholder={t('collections.namePlaceholder')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                required
              />
            </div>
          )}
        </form.Field>

        <form.Field name="name_tk">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="name_tk">{t('fields.nameTk')}</Label>
              <Input
                id="name_tk"
                placeholder={t('collections.namePlaceholder')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                required
              />
            </div>
          )}
        </form.Field>

        <form.Field name="name_en">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="name_en">{t('fields.nameEn')}</Label>
              <Input
                id="name_en"
                placeholder={t('collections.namePlaceholder')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                required
              />
            </div>
          )}
        </form.Field>

        <form.Field name="name_tr">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="name_tr">{t('fields.nameTr')}</Label>
              <Input
                id="name_tr"
                placeholder={t('collections.namePlaceholder')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </div>
          )}
        </form.Field>

        {canBlock && (
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <div className="space-y-0.5">
              <Label>{t('fields.status')}</Label>
              <Badge variant={collection.is_active ? 'success' : 'destructive'}>
                {collection.is_active ? t('active') : t('blocked')}
              </Badge>
            </div>
            <ConfirmSwitch
              checked={collection.is_active}
              onConfirmedChange={onToggleStatus}
              title={t('confirm.blockTitle')}
              description={t('confirm.blockText')}
              confirmLabel={t('confirm.blockConfirm')}
            />
          </div>
        )}
      </div>

      <form.Field name="product_ids">
        {(field) => (
          <div className="space-y-3 rounded-xl border px-5 py-5">
            <div className="flex items-center justify-between">
              <Label>{t('collections.products')}</Label>
              {field.state.value.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {t('collections.selectedCount', { count: field.state.value.length })}
                </span>
              )}
            </div>

            <InputGroup className="max-w-xs">
              <InputGroupAddon>
                <InputGroupText>
                  <Search className="size-4 text-muted-foreground" />
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                placeholder={t('collections.searchProducts')}
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </InputGroup>

            <div className="max-h-64 space-y-1 overflow-y-auto">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const isChecked = field.state.value.includes(product.id)
                  return (
                    <label
                      key={product.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.handleChange([...field.state.value, product.id])
                          } else {
                            field.handleChange(field.state.value.filter((id) => id !== product.id))
                          }
                        }}
                      />
                      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                        {product.images?.[0] ? (
                          <img
                            src={buildFileUrl(product.images[0])}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="size-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {getTranslationName(product.translations, uiLang) ||
                            product.translations[0]?.name ||
                            `Product #${product.id}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.price} TMT
                          {shopsMap.get(product.shop_base_id) && (
                            <span> &middot; {shopsMap.get(product.shop_base_id)}</span>
                          )}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">#{product.id}</span>
                    </label>
                  )
                })
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  {t('collections.noProducts')}
                </p>
              )}
            </div>
          </div>
        )}
      </form.Field>
    </Form>
  )
}
