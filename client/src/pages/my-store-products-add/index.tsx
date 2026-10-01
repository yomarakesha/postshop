import { useRef, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowLeft, ChevronRight, Trash2, Upload } from 'lucide-react'
import { CategoryModal } from './ui/CategoryModal'
import { VendorBarcodeInput } from './ui/VendorBarcodeInput'
import type { ModalRef } from '#/shared/ui/Modal'
import { REFERENCE_LIST_LIMIT } from '#/shared/constants/pagination'
import { BrandModal } from '#/shared/ui/BrandModal'
import {
  useCreateProductProductsPost,
  useGetCurrenciesCurrenciesGet,
  useGetMeasureUnitsMeasureUnitsGet,
} from '#/shared/openapi/queries/queries'
import { DiscountType } from '#/shared/openapi/requests/types.gen'
import { Input } from '#/shared/ui/Input'
import { TextArea } from '#/shared/ui/TextArea'
import { PRODUCT_DESCRIPTION_RECOMMENDED } from '#/shared/constants/product'
import { Select } from '#/shared/ui/Select'
import { Button } from '#/shared/ui/Button'
import { settled } from '#/shared/lib/settled'
import { getProductSaveErrorMessage } from '#/shared/lib/apiError'
import { compressImage, imageErrorKey } from '#/shared/utils/compressImage'
import { isValidVendorBarcode, normalizeBarcode } from '#/shared/utils/barcode'

export const AddProductPage = () => {
  const { t, i18n } = useTranslation()
  const { storeId } = useParams({ from: '/my-store/$storeId' })
  const navigate = useNavigate()
  // Ошибку объясняем сами: штрихкод (409/422) и обрыв загрузки фото иначе
  // приходили служебным английским текстом или «Нет связи с сервером».
  const createProduct = useCreateProductProductsPost(undefined, {
    onError: (err) => toast.error(getProductSaveErrorMessage(err, true)),
  })
  const { data: measureUnits } = useGetMeasureUnitsMeasureUnitsGet({
    query: { limit: REFERENCE_LIST_LIMIT },
  })
  const { data: currencies } = useGetCurrenciesCurrenciesGet({
    query: { limit: REFERENCE_LIST_LIMIT },
  })

  const [images, setImages] = useState<Array<File>>([])
  const [previews, setPreviews] = useState<Array<string>>([])
  const [categoryName, setCategoryName] = useState('')
  const [brandName, setBrandName] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const categoryModalRef = useRef<ModalRef>(null)
  const brandModalRef = useRef<ModalRef>(null)

  const [isProcessingImages, setIsProcessingImages] = useState(false)

  // Фото ужимаются в браузере до 1600 px (см. compressImage): снимок с
  // телефона весил мегабайты, и на слабой связи товар с пятью фото не
  // сохранялся вовсе. Файл, который не удалось прочитать, не добавляем и
  // говорим об этом сразу, а не после долгой отправки формы.
  const handleAddImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (fileInputRef.current) fileInputRef.current.value = ''
    const toAdd = files.slice(0, 5 - images.length)
    if (toAdd.length === 0) return
    setIsProcessingImages(true)
    const results = await Promise.allSettled(toAdd.map((file) => compressImage(file)))
    setIsProcessingImages(false)
    const prepared: Array<File> = []
    for (const result of results) {
      if (result.status === 'fulfilled') prepared.push(result.value)
      else toast.error(t(imageErrorKey(result.reason)))
    }
    setImages((prev) => [...prev, ...prepared].slice(0, 5))
    setPreviews((prev) => [...prev, ...prepared.map((f) => URL.createObjectURL(f))].slice(0, 5))
  }

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(previews[index])
    setImages((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      currencyId: '',
      categoryId: '',
      brandId: '',
      hashtag: '',
      measureUnitId: '',
      discountType: '',
      discount: '',
      vendorBarcode: '',
    },
    onSubmit: async ({ value }) => {
      if (
        !value.name ||
        !value.description ||
        !value.price ||
        Number(value.price) <= 0 ||
        !value.categoryId ||
        !value.measureUnitId ||
        images.length === 0
      ) {
        setError(t('addProduct.error'))
        return
      }
      if (!isValidVendorBarcode(value.vendorBarcode)) {
        setError(t('productBarcode.invalid'))
        return
      }
      setError('')

      // Язык был прошит туркменским: продавец, работающий на русском, писал
      // свой текст в туркменское поле, и на остальных языках товар выглядел
      // неверно. Пишем в язык интерфейса; остальные языки подставит выбор
      // перевода с запасным вариантом.
      const translations = JSON.stringify([
        { language: i18n.language, name: value.name, description: value.description },
      ])

      const result = await settled(
        createProduct.mutateAsync({
          body: {
            category_id: Number(value.categoryId),
            shop_base_id: Number(storeId),
            measure_unit_id: Number(value.measureUnitId),
            brand_id: value.brandId ? Number(value.brandId) : null,
            currency_id: value.currencyId ? Number(value.currencyId) : null,
            translations,
            price: Number(value.price),
            hashtag: value.hashtag || null,
            discount_type: value.discountType ? (value.discountType as DiscountType) : null,
            discount: value.discount ? Number(value.discount) : null,
            images: images.length > 0 ? (images as unknown as Array<string>) : undefined,
            vendor_barcode: normalizeBarcode(value.vendorBarcode) || null,
          },
        }),
      )

      if (result?.data) {
        toast.success(t('addProduct.moderationTitle'), {
          description: t('addProduct.moderationDescription'),
          duration: 6000,
        })
        navigate({ to: '/my-store/$storeId/products', params: { storeId } })
      }
    },
  })

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => navigate({ to: '/my-store/$storeId/products', params: { storeId } })}
        className="flex items-center gap-2 text-passive2 mb-4"
      >
        <ArrowLeft size={18} />
        <span>{t('addProduct.backToProducts')}</span>
      </button>

      <div className="bg-white rounded-xl shadow-base p-6">
        <h1 className="p1 font-bold mb-6">{t('addProduct.title')}</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-1.5">
            <label className="p3 font-medium mb-1.5 block">
              {t('addProduct.images')} <span className="text-failure">*</span>{' '}
              <span className="text-passive2">{t('addProduct.imagesMax')}</span>
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
              {previews.map((src, i) => (
                <div key={i} className="relative">
                  <img
                    src={src}
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
              {images.length < 5 && (
                <button
                  type="button"
                  disabled={isProcessingImages}
                  onClick={() => fileInputRef.current?.click()}
                  className="size-24 rounded-xl border-2 border-dashed border-stroke flex flex-col items-center justify-center gap-1 text-passive2"
                >
                  <Upload size={20} />
                  <span className="t2">
                    {isProcessingImages ? t('upload.processing') : t('addProduct.imagesAdd')}
                  </span>
                </button>
              )}
            </div>
          </div>

          <form.Field name="name">
            {(field) => (
              <Input
                label={t('addProduct.name')}
                required
                placeholder={t('addProduct.namePlaceholder')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <TextArea
                label={t('addProduct.description')}
                required
                placeholder={t('addProduct.descriptionPlaceholder')}
                rows={4}
                recommendedLength={PRODUCT_DESCRIPTION_RECOMMENDED}
                counterHint={t('addProduct.descriptionTooLong')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <form.Field name="categoryId">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <label className="p3 font-medium mb-1.5 block">
                    {t('addProduct.category')} <span className="text-failure">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => categoryModalRef.current?.open()}
                    className="flex items-center justify-between w-full p3 px-3 py-2.5 border border-border rounded-base bg-white transition-colors"
                  >
                    <span className={categoryName ? 'text-(--text)' : 'text-passive1'}>
                      {categoryName || t('addProduct.categoryPlaceholder')}
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
                <div className="flex flex-col gap-1.5">
                  <label className="p3 font-medium mb-1.5 block">{t('addProduct.brand')}</label>
                  <button
                    type="button"
                    onClick={() => brandModalRef.current?.open()}
                    className="flex items-center justify-between w-full p3 px-3 py-2.5 border border-border rounded-base bg-white transition-colors"
                  >
                    <span className={brandName ? 'text-(--text)' : 'text-passive1'}>
                      {brandName || t('addProduct.brandPlaceholder')}
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
                  label={t('addProduct.price')}
                  required
                  type="number"
                  placeholder={t('addProduct.pricePlaceholder')}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              )}
            </form.Field>

            <form.Field name="currencyId">
              {(field) => (
                <Select
                  label={t('addProduct.currency')}
                  placeholder={t('addProduct.currencyPlaceholder')}
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
                  label={t('addProduct.measureUnit')}
                  required
                  placeholder={t('addProduct.measureUnitPlaceholder')}
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
                label={t('addProduct.hashtag')}
                placeholder={t('addProduct.hashtagPlaceholder')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>

          <form.Field name="vendorBarcode">
            {(field) => (
              <VendorBarcodeInput value={field.state.value} onChange={field.handleChange} />
            )}
          </form.Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <form.Field name="discountType">
              {(field) => (
                <Select
                  label={t('addProduct.discountType')}
                  placeholder={t('addProduct.discountTypeNone')}
                  value={field.state.value}
                  onChange={(v) => field.handleChange(v)}
                  options={[
                    { label: t('addProduct.discountTypeNone'), value: '' },
                    {
                      label: t('addProduct.discountTypePercentage'),
                      value: DiscountType.PERCENTAGE,
                    },
                    { label: t('addProduct.discountTypeFixed'), value: DiscountType.FIXED },
                  ]}
                />
              )}
            </form.Field>

            <form.Field name="discount">
              {(field) => (
                <Input
                  label={t('addProduct.discount')}
                  type="number"
                  placeholder={t('addProduct.discountPlaceholder')}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              )}
            </form.Field>
          </div>

          {error && <p className="t1 text-failure text-center">{error}</p>}

          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" disabled={isSubmitting || isProcessingImages}>
                {isSubmitting ? t('addProduct.submitting') : t('addProduct.submit')}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </div>
    </div>
  )
}
