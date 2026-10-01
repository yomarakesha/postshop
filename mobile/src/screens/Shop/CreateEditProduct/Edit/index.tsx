import { productsApi } from "@/api/products";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { File, Paths } from "expo-file-system";
import * as ExpoImagePicker from "expo-image-picker";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { StyleSheet } from "react-native-unistyles";

import BrandSheet from "@/components/BottomSheet/BrandSheet";
import CategoriesSheet from "@/components/BottomSheet/CategoriesSheet";
import Header from "@/components/Header";
import Button from "@/ui/Button";
import ScreenFooter from "@/ui/ScreenFooter";

import { brandApi } from "@/api/brandApi";
import { categoryApi } from "@/api/categoryApi";
import MeasureUnitSheet from "@/components/BottomSheet/MeasureUnitSheet";
import useAppStore from "@/store/useAppStore";
import useShopStore from "@/store/useShopStore";
import ActivityIndicator from "@/ui/ActivityIndicator";
import ErrorAlert from "@/utils/errorAlert";
import Toast from "react-native-toast-message";
import { getImageUrl } from "@/utils/getImageUrl";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Platform, View } from "react-native";
import BarcodeSection, {
  isVendorBarcodeValid,
  normalizeVendorBarcode,
  productSaveError,
} from "../_components/BarcodeSection";
import CategoryBrandSection from "../_components/CategoryBrandSection";
import PriceSection from "../_components/CurrencyPriceSection";
import DiscountSection from "../_components/DiscountSection";
import HashtagSection from "../_components/HashtagSection";
import ImagePicker from "../_components/ImagePicker";
import MeasureUnitSection from "../_components/MeasureUnitSection";
import ProductInfoSection from "../_components/ProductInfoSection";
import CurrencySheet from "@/components/BottomSheet/CurrencySheet";
import useLayoutHeight from "@/hooks/useLayoutHeight";
import {
  downscaleImages,
  PRODUCT_IMAGE_MAX_SIDE,
} from "@/utils/downscaleImage";

const EditProductScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { height: footerHeight, onLayout: onFooterLayout } = useLayoutHeight();
  const { data, isLoading, isFetching } = productsApi.useGet(Number(id), {
    enabled: !!id,
  });
  const categoryQuery = categoryApi.useGet(data?.category_id!, {
    enabled: !!data?.category_id,
  });
  const brandQuery = brandApi.useGet(data?.brand_id!, {
    enabled: !!data?.brand_id,
  });
  const updateMutation = productsApi.useUpdate(Number(id));
  const shopBaseId = useShopStore((s) => s.activeShopBaseId);
  const currentLanguage = useAppStore((s) => s.lang);
  const { t } = useTranslation();
  const [isDownloadingImages, setIsDownloadingImages] = useState(false);

  const category = useMemo(() => {
    if (!categoryQuery.data) return undefined;
    return {
      id: categoryQuery.data.id,
      name:
        categoryQuery.data.translations.find(
          (t) => t.language === currentLanguage,
        )?.name ?? categoryQuery.data.translations[0].name,
    };
  }, [categoryQuery.data, currentLanguage]);

  const brand = useMemo(() => {
    if (!brandQuery.data) return undefined;
    return {
      id: brandQuery.data.id,
      name: brandQuery.data.name,
    };
  }, [brandQuery.data]);

  const getMeasureUnitName = (translations: MeasureUnit.Translation[]) => {
    return (
      translations.find((t) => t.language === currentLanguage)?.name ??
      translations[0].name
    );
  };

  const [images, setImages] = useState<ExpoImagePicker.ImagePickerAsset[]>([]);
  const [hasDiscount, setHasDiscount] = useState(data?.discount ? true : false);
  const [discountType, setDiscountType] = useState<Product.DiscountType>(
    data?.discount_type ?? "percentage",
  );
  const [hasHashtag, setHasHashtag] = useState(data?.hashtag ? true : false);
  const [selectedCategory, setSelectedCategory] = useState<
    | {
        id: number;
        name: string;
      }
    | undefined
  >(category);
  const [selectedBrand, setSelectedBrand] = useState<
    | {
        id: number;
        name: string;
      }
    | undefined
  >(brand);
  const [selectedMeasureUnit, setSelectedMeasureUnit] = useState<
    | {
        id: number;
        name: string;
      }
    | undefined
  >(undefined);
  const [selectedCurrency, setSelectedCurrency] =
    useState<Currency.Short | null>(null);
  const router = useRouter();

  const brandSheetRef = useRef<TrueSheet>(null);
  const categorySheetRef = useRef<TrueSheet>(null);
  const measureUnitSheetRef = useRef<TrueSheet>(null);
  const currencySheetRef = useRef<TrueSheet>(null);

  const formValues = useMemo(() => {
    if (!data) return undefined;
    return {
      name: data.translations?.[0]?.name ?? "",
      description: data.translations?.[0]?.description ?? "",
      price: Number(data.price),
      discount: data.discount,
      hashtag: data.hashtag,
      vendor_barcode: data.vendor_barcode ?? "",
    };
  }, [data]);

  const {
    control,
    formState: { isValid },
    setValue,
    handleSubmit,
  } = useForm<Product.Form.CreateBody>({
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      discount: undefined,
      hashtag: undefined,
      vendor_barcode: "",
    },
    values: formValues,
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  const discount = useWatch({ control, name: "discount" });
  const hashtag = useWatch({ control, name: "hashtag" });
  const vendorBarcode = useWatch({ control, name: "vendor_barcode" });
  const [barcodeServerError, setBarcodeServerError] = useState<string>();

  // Отказ сервера относится к введённому коду — после правки он неактуален.
  useEffect(() => setBarcodeServerError(undefined), [vendorBarcode]);

  const isDisabled =
    !isValid ||
    images.length === 0 ||
    !selectedCategory ||
    !selectedBrand ||
    !selectedMeasureUnit ||
    (hasDiscount && !discount) ||
    (hasHashtag && !hashtag) ||
    !isVendorBarcodeValid(vendorBarcode);

  const handleSelectImages = async () => {
    if (images.length >= 5) return;
    const permission =
      await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.4,
      allowsMultipleSelection: true,
      allowsEditing: false,
      selectionLimit: 5 - images.length,
    });
    if (!result.canceled) {
      // quality пикера только пережимает JPEG, а не уменьшает фото в пикселях.
      const resized = await downscaleImages(
        result.assets,
        PRODUCT_IMAGE_MAX_SIDE,
      );
      setImages((prev) => {
        const remaining = 5 - prev.length;

        return [...prev, ...resized.slice(0, remaining)];
      });
    }
  };

  const handleRemove = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handlePressCategory = useCallback(
    () => categorySheetRef.current?.present(),
    [],
  );
  const handlePressBrand = useCallback(
    () => brandSheetRef.current?.present(),
    [],
  );
  const handlePressMeasureUnit = useCallback(
    () => measureUnitSheetRef.current?.present(),
    [],
  );
  const handlePressCurrency = useCallback(
    () => currencySheetRef.current?.present(),
    [],
  );

  const handleSelectBrand = useCallback((id: number, name: string) => {
    setSelectedBrand({ id, name });
    brandSheetRef.current?.dismiss();
  }, []);

  const handleSelectCategory = useCallback((id: number, name: string) => {
    setSelectedCategory({ id, name });
    categorySheetRef.current?.dismiss();
  }, []);

  const handleSelectMeasureUnit = useCallback((id: number, name: string) => {
    setSelectedMeasureUnit({ id, name });
    measureUnitSheetRef.current?.dismiss();
  }, []);

  const handleSelectCurrency = useCallback(
    (id: number, translations: Currency.Translation[], code: string) => {
      setSelectedCurrency({ id, translations, code });
      currencySheetRef.current?.dismiss();
    },
    [],
  );

  const handleToggleDiscount = useCallback(
    () => setHasDiscount((prev) => !prev),
    [],
  );
  const handleToggleHashtag = useCallback(
    () => setHasHashtag((prev) => !prev),
    [],
  );
  const handleRemoveBrand = useCallback(() => {
    setSelectedBrand(undefined);
  }, []);

  const handleChangeDiscountType = useCallback(
    (type: Product.DiscountType) => {
      setDiscountType(type);
      setValue("discount", null);
    },
    [setValue],
  );

  const onSubmit: SubmitHandler<Product.Form.CreateBody> = async (data) => {
    if (!selectedCategory || !selectedBrand || !selectedMeasureUnit) return;

    const translations: Product.Translation[] = [
      { language: "tk", name: data.name, description: data.description },
    ];

    try {
      await updateMutation.mutateAsync({
        shop_base_id: shopBaseId!,
        translations: JSON.stringify(translations),
        price: data.price,
        category_id: selectedCategory.id,
        brand_id: selectedBrand?.id,
        discount_type: hasDiscount ? discountType : null,
        discount: hasDiscount ? discount : null,
        hashtag: hasHashtag ? hashtag : null,
        measure_unit_id: selectedMeasureUnit?.id,
        remove_discount: !hasDiscount,
        images: images.map((img) => ({
          uri: Platform.OS === "ios" ? img.uri.replace("file://", "") : img.uri,
          name: img.fileName ?? img.uri.split("/").pop() ?? "image.jpg",
          type: img.mimeType ?? "image/jpeg",
        })),
        currency_id: selectedCurrency?.id ? selectedCurrency.id : undefined,
        // Пустое поле формы сервер считает непереданным, поэтому стёртый
        // штрихкод снимается отдельным флагом.
        ...(normalizeVendorBarcode(data.vendor_barcode)
          ? { vendor_barcode: normalizeVendorBarcode(data.vendor_barcode) }
          : { remove_vendor_barcode: true }),
      });

      for (const img of images) {
        try {
          const f = new File(img.uri);
          if (f.exists) f.delete();
        } catch {}
      }

      router.back();
    } catch (e: any) {
      const { message, field } = productSaveError(t, e);
      if (field === "vendor_barcode") setBarcodeServerError(message);
      if (message) {
        Toast.show({ type: "error", text1: t("error"), text2: message });
      } else {
        ErrorAlert(t, e);
      }
    }
  };

  const imagesKey = useMemo(
    () => data?.images?.join("|") ?? "",
    [data?.images],
  );

  useEffect(() => {
    if (!data?.images?.length) {
      return;
    }

    if (isFetching) return;

    let cancelled = false;

    const sourceImages = data.images;

    const downloadImages = async () => {
      try {
        setIsDownloadingImages(true);

        const stamp = Date.now();

        const results = await Promise.allSettled(
          sourceImages.map(async (img, index) => {
            const fileName = `product-${id}-${index}-${stamp}.jpg`;
            const dest = new File(Paths.cache, fileName);

            if (dest.exists) {
              dest.delete();
            }

            const file = await File.downloadFileAsync(getImageUrl(img), dest);

            return {
              uri: file.uri,
              fileName,
              mimeType: "image/jpeg",
              width: 0,
              height: 0,
              type: "image",
              assetId: null,
            } as unknown as ExpoImagePicker.ImagePickerAsset;
          }),
        );

        if (cancelled) return;

        const files = results
          .filter(
            (
              r,
            ): r is PromiseFulfilledResult<ExpoImagePicker.ImagePickerAsset> =>
              r.status === "fulfilled",
          )
          .map((r) => r.value);

        setImages(files);

        const failedCount = results.filter(
          (r) => r.status === "rejected",
        ).length;

        if (failedCount > 0) {
          console.warn(
            `[EditProduct] ${failedCount}/${sourceImages.length} image downloads failed`,
          );

          if (files.length === 0) {
            ErrorAlert(t);
          }
        }
      } finally {
        if (!cancelled) {
          setIsDownloadingImages(false);
        }
      }
    };

    downloadImages();

    return () => {
      cancelled = true;
    };
  }, [imagesKey, isFetching]);

  useEffect(() => {
    if (!data) return;

    setHasDiscount(!!data.discount);
    setHasHashtag(!!data.hashtag);
    setDiscountType(data.discount_type ?? "percentage");

    if (data.measure_unit_id && data.measure_unit) {
      setSelectedMeasureUnit({
        id: data.measure_unit_id,
        name: getMeasureUnitName(data.measure_unit.translations ?? []),
      });
    }

    if (data.currency) {
      setSelectedCurrency(data.currency);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id]);

  useEffect(() => {
    if (category) setSelectedCategory(category);
    if (brand) setSelectedBrand(brand);
  }, [category, brand]);

  return (
    <>
      <Header
        title={t("store.addEditProduct.editHeaderTitle")}
        withGoBack
        backgroundColor="white"
      />

      {isLoading ? (
        <ActivityIndicator isFullScreen />
      ) : (
        <>
          <KeyboardAwareScrollView
            style={styles.flex1}
            contentContainerStyle={styles.content(footerHeight)}
            bottomOffset={footerHeight + 24}
          >
            <View style={styles.imagePickerWrapper}>
              <ImagePicker
                images={images}
                onRemove={handleRemove}
                onUpload={handleSelectImages}
                t={t}
              />

              {isDownloadingImages && (
                <View style={styles.imagesLoadingOverlay}>
                  <ActivityIndicator />
                </View>
              )}
            </View>
            <ProductInfoSection control={control} t={t} />
            <PriceSection
              control={control}
              t={t}
              selectedCurrency={selectedCurrency?.translations}
              currencyCode={selectedCurrency?.code}
              onPressCurrency={handlePressCurrency}
            />
            <MeasureUnitSection
              selectedMeasureUnit={selectedMeasureUnit?.name}
              onPressMeasureUnit={handlePressMeasureUnit}
              t={t}
            />
            <BarcodeSection
              control={control}
              platformBarcode={data?.barcode}
              serverError={barcodeServerError}
              t={t}
            />
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
              title={t("common.save")}
              disabled={isDisabled || updateMutation.isPending}
              onPress={handleSubmit(onSubmit)}
              variant="primary"
            />
          </ScreenFooter>
        </>
      )}

      <CategoriesSheet
        ref={categorySheetRef}
        onSelect={handleSelectCategory}
        t={t}
      />
      <BrandSheet ref={brandSheetRef} onSelect={handleSelectBrand} t={t} />
      <MeasureUnitSheet
        ref={measureUnitSheetRef}
        onSelect={handleSelectMeasureUnit}
        currentLanguage={currentLanguage}
        t={t}
      />
      <CurrencySheet
        ref={currencySheetRef}
        onSelect={handleSelectCurrency}
        t={t}
      />
    </>
  );
};

export default EditProductScreen;

const styles = StyleSheet.create((theme) => ({
  flex1: { flex: 1 },
  imagePickerWrapper: { position: "relative" },
  imagesLoadingOverlay: {
    position: "absolute",
    inset: 0,
    borderRadius: theme.spacing(3),
    backgroundColor: theme.colors.white50,
    justifyContent: "center",
    alignItems: "center",
  },
  // Последняя карточка формы упиралась в закреплённый футер с кнопкой —
  // добавляем его высоту в нижний отступ прокрутки.
  content: (footerHeight: number) => ({
    padding: theme.spacing(4),
    paddingBottom: theme.spacing(4) + footerHeight,
    gap: theme.spacing(3),
  }),
}));
