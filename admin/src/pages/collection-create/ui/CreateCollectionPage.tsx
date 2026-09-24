import { useForm } from '@tanstack/react-form'
import { ImageIcon, Search } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useCreateCollectionMutation } from '../model/useCreateCollectionMutation'
import { useProductsQuery } from '../model/useProductsQuery'
import { useShopsQuery } from '../model/useShopsQuery'
import { buildFileUrl } from '@/shared/lib/buildFileUrl'
import { getTranslationName } from '@/shared/lib/getTranslationName'
import type { CollectionTranslationInput } from '@/shared/openapi/requests'
import { Checkbox } from '@/shared/ui/checkbox'
import { Input } from '@/shared/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/shared/ui/input-group'
import { Label } from '@/shared/ui/label'
import { Form } from '@/widgets/Form'

export function CreateCollectionPage() {
  const { t, i18n } = useTranslation()
  const mutation = useCreateCollectionMutation()
  const { data: productsData } = useProductsQuery()
  const { data: shopsData } = useShopsQuery()
  const products = productsData?.data ?? []
  const shopsMap = new Map<number, string>()

  for (const shop of shopsData?.data ?? []) {
    if (shop.additional?.name) {
      shopsMap.set(shop.id, shop.additional.name)
    }
  }
  const [productSearch, setProductSearch] = useState('')

  const form = useForm({
    defaultValues: {
      name_en: '',
      name_ru: '',
      name_tk: '',
      name_tr: '',
      product_ids: [] as number[],
    },
    onSubmit: ({ value }) => {
      const translations: CollectionTranslationInput[] = [
        { language: 'ru', name: value.name_ru },
        { language: 'tk', name: value.name_tk },
        { language: 'en', name: value.name_en },
      ]
      if (value.name_tr) translations.push({ language: 'tr', name: value.name_tr })
      mutation.mutate({
        translations,
        product_ids: value.product_ids.length > 0 ? value.product_ids : undefined,
      })
    },
  })

  const filteredProducts = products.filter((product) => {
    const name =
      getTranslationName(product.translations, i18n.language) || product.translations[0]?.name || ''
    return name.toLowerCase().includes(productSearch.toLowerCase())
  })

  return (
    <Form
      isSubmitting={mutation.isPending}
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
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
                          {getTranslationName(product.translations, i18n.language) ||
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
