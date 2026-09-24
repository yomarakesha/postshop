import { useRef, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowLeft, ChevronRight, Trash2, Upload } from 'lucide-react'
import type { ModalRef } from '#/shared/ui/Modal'
import { REFERENCE_LIST_LIMIT } from '#/shared/constants/pagination'
import {
  useGetBrandBrandsBrandIdGet,
  useGetCategoryCategoriesCategoryIdGet,
  useGetCurrenciesCurrenciesGet,
  useGetMeasureUnitsMeasureUnitsGet,
  useGetProductProductsProductIdGet,
  useGetProductsProductsGetKey,
  useUpdateProductProductsProductIdPut,
} from '#/shared/openapi/queries'
import { DiscountType } from '#/shared/openapi/requests/types.gen'
import { Input } from '#/shared/ui/Input'
import { TextArea } from '#/shared/ui/TextArea'
import { PRODUCT_DESCRIPTION_RECOMMENDED } from '#/shared/constants/product'
import { Select } from '#/shared/ui/Select'
import { Button } from '#/shared/ui/Button'
import { BrandModal } from '#/shared/ui/BrandModal'
import { CategoryModal } from '#/pages/my-store-products-add/ui/CategoryModal'
import { Spinner } from '#/shared/ui/Spinner'
import { settled } from '#/shared/lib/settled'

type ExistingImage = { type: 'existing'; url: string }
type NewImage = { type: 'new'; file: File; preview: string }
type ImageEntry = ExistingImage | NewImage

export const EditProductPage = () => {
  const { t, i18n } = useTranslation()
  const { storeId, productId } = useParams({
    from: '/my-store/$storeId/products/edit/$productId',
  })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const updateProduct = useUpdateProductProductsProductIdPut()
  const { data: measureUnits } = useGetMeasureUnitsMeasureUnitsGet({
    query: { limit: REFERENCE_LIST_LIMIT },
  })
  const { data: currencies } = useGetCurrenciesCurrenciesGet({
    query: { limit: REFERENCE_LIST_LIMIT },
  })

  const { data: product, isLoading } = useGetProductProductsProductIdGet({
    path: { product_id: Number(productId) },
  })

  const { data: existingBrand } = useGetBrandBrandsBrandIdGet(
    { path: { brand_id: product?.brand_id || 0 } },
    undefined,
    { enabled: !!product?.brand_id },
  )

  const { data: existingCategory } = useGetCategoryCategoriesCategoryIdGet(
    { path: { category_id: product?.category_id || 0 } },
    undefined,
    { enabled: !!product?.category_id },
  )

  const [imageEntries, setImageEntries] = useState<Array<ImageEntry> | null>(null)
  const [brandName, setBrandName] = useState<string | null>(null)
  const [categoryName, setCategoryName] = useState<string | null>(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const brandModalRef = useRef<ModalRef>(null)
  const categoryModalRef = useRef<ModalRef>(null)

  const displayBrandName = brandName ?? existingBrand?.name ?? ''
  const displayCategoryName = categoryName ?? existingCategory?.translations[0]?.name ?? ''

  const entries: Array<ImageEntry> =
    imageEntries ?? product?.images?.map((url) => ({ type: 'existing' as const, url })) ?? []

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const remaining = 5 - entries.length
    const toAdd = files.slice(0, remaining)
    const newEntries: Array<ImageEntry> = toAdd.map((f) => ({
      type: 'new',
      file: f,
      preview: URL.createObjectURL(f),
    }))
    setImageEntries([...entries, ...newEntries])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemoveImage = (index: number) => {
    const entry = entries[index]
    if (entry.type === 'new') URL.revokeObjectURL(entry.preview)
    setImageEntries(entries.filter((_, i) => i !== index))
  }

  const handleImageUrl = (url: string) => {
    if (!url.startsWith('http')) {
      return import.meta.env.VITE_BACKEND_API_URL + '/' + url
    }
    return url
  }

  // Заполняем форму переводом на языке интерфейса, а не первым в списке:
  // иначе продавец на русском правил туркменский текст, не понимая этого.
  const translation =
    product?.translations.find((tr) => tr.language === i18n.language) ?? product?.translations[0]

  const form = useForm({
    defaultValues: {
      name: translation?.name ?? '',
      description: translation?.description ?? '',
      price: product?.price ?? '',
      currencyId: product?.currency_id ? String(product.currency_id) : '',
      categoryId: product?.category_id ? String(product.category_id) : '',
      brandId: product?.brand_id ? String(product.brand_id) : '',
      hashtag: product?.hashtag ?? '',
      measureUnitId: product?.measure_unit_id ? String(product.measure_unit_id) : '',
      discountType: product?.discount_type ?? '',
      discount: product?.discount ?? '',
    },
    onSubmit: async ({ value }) => {
      if (!value.name || !value.description || !value.price || Number(value.price) <= 0) {
        setError(t('editProduct.error'))
        return
      }
      setError('')

      // Как и при добавлении: пишем в язык интерфейса, а не всегда в
      // туркменский. Сервер обновляет перевод по языку и не трогает остальные.
      const translations = JSON.stringify([
        { language: i18n.language, name: value.name, description: value.description },
      ])

      const imagesChanged = imageEntries !== null
      const imagesToSend = imagesChanged
        ? await Promise.all(
            entries.map(async (e): Promise<File> => {
              if (e.type === 'new') return e.file
              const url = e.url.startsWith('http') ? e.url : `/${e.url}`
              const res = await fetch(url)
              const blob = await res.blob()
              const filename = e.url.split('/').pop() ?? 'image.webp'
              return new File([blob], filename, { type: blob.type })
            }),
          )
        : undefined

      const result = await settled(
        updateProduct.mutateAsync({
          path: { product_id: Number(productId) },
          body: {
            translations,
            category_id: value.categoryId ? Number(value.categoryId) : undefined,
            measure_unit_id: value.measureUnitId ? Number(value.measureUnitId) : null,
            brand_id: value.brandId ? Number(value.brandId) : null,
            currency_id: value.currencyId ? Number(value.currencyId) : null,
            price: Number(value.price),
            hashtag: value.hashtag || null,
            ...(value.discountType
              ? {
                  discount_type: value.discountType as DiscountType,
                  discount: value.discount ? Number(value.discount) : null,
                }
              : { remove_discount: true }),
            images: imagesToSend as unknown as Array<string> | undefined,
          },
        }),
      )

      if (result?.data) {
        await queryClient.resetQueries({ queryKey: [useGetProductsProductsGetKey] })
        toast.success(t('editProduct.moderationTitle'), {
          description: t('editProduct.moderationDescription'),
          duration: 6000,
        })
        navigate({ to: '/my-store/$storeId/products', params: { storeId } })
      }
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => navigate({ to: '/my-store/$storeId/products', params: { storeId } })}
        className="flex items-center gap-2 text-passive2 mb-4"
      >
        <ArrowLeft size={18} />
        <span>{t('editProduct.backToProducts')}</span>
      </button>

      <div className="bg-white rounded-xl shadow-base p-6">
        <h1 className="p1 font-bold mb-6">{t('editProduct.title')}</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="flex flex-col gap-5"
        >
          <div>
            <label className="p3 font-medium mb-1.5 block">
              {t('editProduct.images')} <span className="text-failure">*</span>{' '}
              <span className="text-passive2">{t('editProduct.imagesMax')}</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleAddImages}
            />
            <div className="flex gap-3 flex-wrap">
              {entries.map((entry, i) => (
                <div key={i} className="relative">
                  <img
                    src={entry.type === 'existing' ? handleImageUrl(entry.url) : entry.preview}
                    alt=""
                    className="size-24 rounded-xl object-contain border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute -top-2 -right-2 size-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
              {entries.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="size-24 rounded-xl border-2 border-dashed border-stroke flex flex-col items-center justify-center gap-1 text-passive2"
                >
                  <Upload size={20} />
                  <span className="t2">{t('editProduct.imagesAdd')}</span>
                </button>
              )}
            </div>
          </div>

          <form.Field name="name">
            {(field) => (
              <Input
                label={t('editProduct.name')}
                required
                placeholder={t('editProduct.namePlaceholder')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <TextArea
                label={t('editProduct.description')}
                required
                placeholder={t('editProduct.descriptionPlaceholder')}
                rows={4}
                recommendedLength={PRODUCT_DESCRIPTION_RECOMMENDED}
                counterHint={t('editProduct.descriptionTooLong')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <form.Field name="categoryId">
              {(field) => (
                <div>
                  <label className="p3 font-medium mb-1.5 block">
                    {t('editProduct.category')} <span className="text-failure">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => categoryModalRef.current?.open()}
                    className="flex items-center justify-between w-full p3 px-3 py-2.5 border border-border rounded-base bg-white transition-colors"
                  >
                    <span className={displayCategoryName ? 'text-(--text)' : 'text-passive1'}>
                      {displayCategoryName || t('editProduct.categoryPlaceholder')}
                    </span>
                    <ChevronRight size={16} className="text-passive2" />
                  </button>
                  <CategoryModal
                    ref={categoryModalRef}
                    onSelect={(id, name) => {
                      field.handleChange(String(id))
                      setCategoryName(name)
                    }}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="brandId">
              {(field) => (
                <div>
                  <label className="p3 font-medium mb-1.5 block">{t('editProduct.brand')}</label>
                  <button
                    type="button"
                    onClick={() => brandModalRef.current?.open()}
                    className="flex items-center justify-between w-full p3 px-3 py-2.5 border border-border rounded-base bg-white transition-colors"
                  >
                    <span className={displayBrandName ? 'text-(--text)' : 'text-passive1'}>
                      {displayBrandName || t('editProduct.brandPlaceholder')}
                    </span>
                    <ChevronRight size={16} className="text-passive2" />
                  </button>
                  <BrandModal
                    ref={brandModalRef}
                    selectedId={field.state.value ? Number(field.state.value) : undefined}
                    onSelect={(id, name) => {
                      field.handleChange(String(id))
                      setBrandName(name)
                    }}
                  />
                </div>
              )}
            </form.Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <form.Field name="price">
              {(field) => (
                <Input
                  label={t('editProduct.price')}
                  required
                  type="number"
                  placeholder={t('editProduct.pricePlaceholder')}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              )}
            </form.Field>

            <form.Field name="currencyId">
              {(field) => (
                <Select
                  label={t('editProduct.currency')}
                  placeholder={t('editProduct.currencyPlaceholder')}
                  value={field.state.value}
                  onChange={(v) => field.handleChange(v)}
                  options={
                    currencies?.map((c) => ({
                      label:
                        c.translations.find((tr) => tr.language === i18n.language)?.name ?? c.code,
                      value: String(c.id),
                    })) ?? []
                  }
                />
              )}
            </form.Field>

            <form.Field name="measureUnitId">
              {(field) => (
                <Select
                  label={t('editProduct.measureUnit')}
                  required
                  placeholder={t('editProduct.measureUnitPlaceholder')}
                  value={field.state.value}
                  onChange={(v) => field.handleChange(v)}
                  options={
                    measureUnits?.map((u) => ({
                      label:
                        u.translations.find((tr) => tr.language === i18n.language)?.name ?? u.code,
                      value: String(u.id),
                    })) ?? []
                  }
                />
              )}
            </form.Field>
          </div>

          <form.Field name="hashtag">
            {(field) => (
              <Input
                label={t('editProduct.hashtag')}
                placeholder={t('editProduct.hashtagPlaceholder')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <form.Field name="discountType">
              {(field) => (
                <Select
                  label={t('editProduct.discountType')}
                  placeholder={t('editProduct.discountTypeNone')}
                  value={field.state.value}
                  onChange={(v) => field.handleChange(v)}
                  options={[
                    { label: t('editProduct.discountTypeNone'), value: '' },
                    {
                      label: t('editProduct.discountTypePercentage'),
                      value: DiscountType.PERCENTAGE,
                    },
                    { label: t('editProduct.discountTypeFixed'), value: DiscountType.FIXED },
                  ]}
                />
              )}
            </form.Field>

            <form.Field name="discount">
              {(field) => (
                <form.Subscribe selector={(s) => !s.values.discountType}>
                  {(noDiscount) => (
                    <div className={noDiscount ? 'opacity-40' : undefined}>
                      <Input
                        label={t('editProduct.discount')}
                        type="number"
                        placeholder={t('editProduct.discountPlaceholder')}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={noDiscount}
                      />
                    </div>
                  )}
                </form.Subscribe>
              )}
            </form.Field>
          </div>

          {error && <p className="t1 text-failure text-center">{error}</p>}

          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('editProduct.submitting') : t('editProduct.submit')}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </div>
    </div>
  )
}
