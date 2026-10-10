import { productsApi } from '@/api/products'
import { TrueSheet } from '@lodev09/react-native-true-sheet'
import * as ExpoImagePicker from 'expo-image-picker'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { StyleSheet } from 'react-native-unistyles'

import BrandSheet from '@/components/BottomSheet/BrandSheet'
import CategoriesSheet from '@/components/BottomSheet/CategoriesSheet'
import Header from '@/components/Header'
import Button from '@/ui/Button'
import ScreenFooter from '@/ui/ScreenFooter'

import MeasureUnitSheet from '@/components/BottomSheet/MeasureUnitSheet'
import useAppStore from '@/store/useAppStore'
import useShopStore from '@/store/useShopStore'
import ErrorAlert from '@/utils/errorAlert'
import Toast from 'react-native-toast-message'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import BarcodeSection, {
  isVendorBarcodeValid,
  normalizeVendorBarcode,
  productSaveError,
} from '../_components/BarcodeSection'
import CategoryBrandSection from '../_components/CategoryBrandSection'
import PriceSection from '../_components/CurrencyPriceSection'
import DiscountSection from '../_components/DiscountSection'
import HashtagSection from '../_components/HashtagSection'
import ImagePicker from '../_components/ImagePicker'
import MeasureUnitSection from '../_components/MeasureUnitSection'
import ProductInfoSection from '../_components/ProductInfoSection'
import CurrencySheet from '@/components/BottomSheet/CurrencySheet'
import useLayoutHeight from '@/hooks/useLayoutHeight'
import { downscaleImages, PRODUCT_IMAGE_MAX_SIDE } from '@/utils/downscaleImage'

const CreateProductScreen = () => {
  const shopBaseId = useShopStore((s) => s.activeShopBaseId)
  const { t } = useTranslation()
  const [images, setImages] = useState<ExpoImagePicker.ImagePickerAsset[]>([])
  const [hasDiscount, setHasDiscount] = useState(false)
  const [hasHashtag, setHasHashtag] = useState(false)
  const currentLanguage = useAppStore((s) => s.lang)
  const { height: footerHeight, onLayout: onFooterLayout } = useLayoutHeight()

  const [discountType, setDiscountType] = useState<Product.DiscountType>('percentage')
  const [selectedBrand, setSelectedBrand] = useState<{
    id: number
    name: string
  } | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<{
    id: number
    name: string
  } | null>(null)
  const [selectedMeasureUnit, setSelectedMeasureUnit] = useState<{
    id: number
    name: string
  } | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState<{
    id: number
    translations: Currency.Translation[]
    code: string
  } | null>(null)
  const router = useRouter()
  const createMutation = productsApi.useCreate()

  const brandSheetRef = useRef<TrueSheet>(null)
  const categorySheetRef = useRef<TrueSheet>(null)
  const measureUnitSheetRef = useRef<TrueSheet>(null)
  const currencySheetRef = useRef<TrueSheet>(null)

  const {
    control,
    formState: { isValid },
    handleSubmit,
    setValue,
  } = useForm<Product.Form.CreateBody>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      discount: undefined,
      hashtag: undefined,
      vendor_barcode: '',
    },
  })

  const discount = useWatch({ control, name: 'discount' })
  const hashtag = useWatch({ control, name: 'hashtag' })
  const vendorBarcode = useWatch({ control, name: 'vendor_barcode' })
  const [barcodeServerError, setBarcodeServerError] = useState<string>()

  // Отказ сервера относится к введённому коду — после правки он неактуален.
  useEffect(() => setBarcodeServerError(undefined), [vendorBarcode])

  const isDisabled =
    !isValid ||
    images.length === 0 ||
    !selectedCategory ||
    !selectedBrand ||
    !selectedMeasureUnit ||
    (hasDiscount && !discount) ||
    (hasHashtag && !hashtag) ||
    !isVendorBarcodeValid(vendorBarcode)

  const handleSelectImages = async () => {
    if (images.length >= 5) return

    const permission = await ExpoImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) return

    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.4,
      allowsMultipleSelection: true,
      allowsEditing: false,
      selectionLimit: 5 - images.length,
    })

    if (!result.canceled) {
      // quality пикера только пережимает JPEG, а не уменьшает фото в пикселях.
      const resized = await downscaleImages(result.assets, PRODUCT_IMAGE_MAX_SIDE)
      setImages((prev) => {
        const remaining = 5 - prev.length

        return [...prev, ...resized.slice(0, remaining)]
      })
    }
  }

  const handleRemove = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handlePressCategory = useCallback(() => categorySheetRef.current?.present(), [])
  const handlePressBrand = useCallback(() => brandSheetRef.current?.present(), [])

  const handlePressMeasureUnit = useCallback(() => measureUnitSheetRef.current?.present(), [])
  const handlePressCurrency = useCallback(() => currencySheetRef.current?.present(), [])

  const handleSelectBrand = useCallback((id: number, name: string) => {
    setSelectedBrand({ id, name })
    brandSheetRef.current?.dismiss()
  }, [])

  const handleSelectCategory = useCallback((id: number, name: string) => {
    setSelectedCategory({ id, name })
    categorySheetRef.current?.dismiss()
  }, [])

  const handleSelectMeasureUnit = useCallback((id: number, name: string) => {
    setSelectedMeasureUnit({ id, name })
    measureUnitSheetRef.current?.dismiss()
  }, [])

  const handleCurrencySelect = useCallback(
    (id: number, translations: Currency.Translation[], code: string) => {
      setSelectedCurrency({ id, translations, code })
      currencySheetRef.current?.dismiss()
    },
    [],
  )

  const handleToggleDiscount = useCallback(() => setHasDiscount((prev) => !prev), [])
  const handleToggleHashtag = useCallback(() => setHasHashtag((prev) => !prev), [])

  const handleRemoveBrand = useCallback(() => {
    setSelectedBrand(null)
  }, [])

  const handleChangeDiscountType = useCallback(
    (type: Product.DiscountType) => {
      setDiscountType(type)
      setValue('discount', null)
    },
    [setValue],
  )

  const onSubmit: SubmitHandler<Product.Form.CreateBody> = async (data) => {
    if (!selectedCategory || !selectedBrand || !selectedMeasureUnit) return

    const translations: Product.Translation[] = [
      { language: 'tk', name: data.name, description: data.description },
    ]

    try {
      await createMutation.mutateAsync({
        shop_base_id: shopBaseId!,
        translations: JSON.stringify(translations),
        price: data.price,
        category_id: selectedCategory.id,
        brand_id: selectedBrand?.id,
        measure_unit_id: selectedMeasureUnit?.id,
        discount_type: hasDiscount ? discountType : null,
        discount: hasDiscount ? discount : null,
        hashtag: hasHashtag ? hashtag : null,
        images: images.map((img) => ({
          uri: Platform.OS === 'ios' ? img.uri.replace('file://', '') : img.uri,
          name: img.fileName ?? img.uri.split('/').pop() ?? 'image.jpg',
          type: img.mimeType ?? 'image/jpeg',
        })),
        currency_id: selectedCurrency ? selectedCurrency.id : undefined,
        // Пустое поле не отправляем: штрихкод производителя необязателен.
        vendor_barcode: normalizeVendorBarcode(data.vendor_barcode) || undefined,
      })

      router.back()
    } catch (e: any) {
      const { message, field } = productSaveError(t, e)
      if (field === 'vendor_barcode') setBarcodeServerError(message)
      if (message) {
        Toast.show({ type: 'error', text1: t('error'), text2: message })
      } else {
        ErrorAlert(t, e)
      }
    }
  }
  return (
    <>
      <Header
        title={t('store.addEditProduct.createHeaderTitle')}
        withGoBack
        backgroundColor="white"
      />

      <KeyboardAwareScrollView
        style={styles.flex1}
        contentContainerStyle={styles.content(footerHeight)}
        bottomOffset={footerHeight + 24}
      >
        <ImagePicker images={images} onRemove={handleRemove} onUpload={handleSelectImages} t={t} />
        <ProductInfoSection control={control} t={t} />
        <PriceSection
          control={control}
          t={t}
          onPressCurrency={handlePressCurrency}
          selectedCurrency={selectedCurrency?.translations}
          currencyCode={selectedCurrency?.code}
        />
        <MeasureUnitSection
          selectedMeasureUnit={selectedMeasureUnit?.name}
          onPressMeasureUnit={handlePressMeasureUnit}
          t={t}
        />
        <BarcodeSection control={control} serverError={barcodeServerError} t={t} />
        <CategoryBrandSection
          selectedCategory={selectedCategory?.name}
          selectedBrand={selectedBrand?.name}
          onPressCategory={handlePressCategory}
          onPressBrand={handlePressBrand}
          onRemoveBrand={handleRemoveBrand}
          t={t}
        />
        <DiscountSection
          control={control}
          hasDiscount={hasDiscount}
          discountType={discountType}
          onToggle={handleToggleDiscount}
          onDiscountTypeChange={handleChangeDiscountType}
          currencyCode={selectedCurrency?.code}
          t={t}
        />
        <HashtagSection
          control={control}
          hasHashtag={hasHashtag}
          onToggle={handleToggleHashtag}
          t={t}
        />
      </KeyboardAwareScrollView>

      <ScreenFooter onLayout={onFooterLayout}>
        <Button
          title={t('store.add')}
          disabled={isDisabled || createMutation.isPending}
          onPress={handleSubmit(onSubmit)}
          variant="primary"
        />
      </ScreenFooter>

      <CategoriesSheet ref={categorySheetRef} onSelect={handleSelectCategory} t={t} />
      <BrandSheet ref={brandSheetRef} onSelect={handleSelectBrand} t={t} />
      <MeasureUnitSheet
        ref={measureUnitSheetRef}
        onSelect={handleSelectMeasureUnit}
        currentLanguage={currentLanguage}
        t={t}
      />
      <CurrencySheet ref={currencySheetRef} onSelect={handleCurrencySelect} t={t} />
    </>
  )
}

export default CreateProductScreen

const styles = StyleSheet.create((theme) => ({
  flex1: { flex: 1 },
  // Последняя карточка формы упиралась в закреплённый футер с кнопкой —
  // добавляем его высоту в нижний отступ прокрутки.
  content: (footerHeight: number) => ({
    padding: theme.spacing(4),
    paddingBottom: theme.spacing(4) + footerHeight,
    gap: theme.spacing(3),
  }),
}))
