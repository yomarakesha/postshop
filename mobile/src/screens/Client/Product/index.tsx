import { cartApi } from '@/api/cartApi'
import { productsApi } from '@/api/products'
import { shopAdditionalApi } from '@/api/shopAdditionalApi'
import ShopInfoSheet from '@/components/BottomSheet/ShopInfoSheet'
import Header from '@/components/Header'
import useCartActions from '@/hooks/useCartActions'
import { stockApi } from '@/api/stockApi'
import usePressScale from '@/hooks/usePressScale'
import useAppStore from '@/store/useAppStore'
import { useCartStore } from '@/store/useCartStore'
import { useUserStore } from '@/store/useUserStore'
import ActivityIndicator from '@/ui/ActivityIndicator'
import DiscountPercentBadge from '@/ui/Badges/DiscountPercent'
import Button from '@/ui/Button'
import ProductCard from '@/ui/ProductCard'
import ScreenFooter from '@/ui/ScreenFooter'
import Typography from '@/ui/Typography'
import { formatMoney, toMoneyNumber } from '@/utils/formatMoney'
import { getImageUrl } from '@/utils/getImageUrl'
import { pickTranslatedDescription, pickTranslatedName } from '@/utils/pickTranslation'
import CircleInfoIcon from '@assets/icons/circle-info.svg'
import MinusIcon from '@assets/icons/minus.svg'
import PlusIcon from '@assets/icons/plus.svg'
import RightChevronIcon from '@assets/icons/right-chevron.svg'
import { TrueSheet } from '@lodev09/react-native-true-sheet'
import { Image } from 'expo-image'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, View } from 'react-native'
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { StyleSheet } from 'react-native-unistyles'
import ImagesList from './_components/ImagesList'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

/**
 * Кнопка «+»/«−» в счётчике товара.
 *
 * Счётчик был собран из голых `Pressable`: нажатие никак не отзывалось, и на
 * синей плашке промах по иконке было не отличить от попадания. Отклик тот же,
 * что у обычных кнопок, — общий хук, а не своя анимация.
 */
const StepperButton = ({
  onPress,
  Icon,
  disabled,
}: {
  onPress: () => void
  Icon: SvgType
  /** Например, «плюс» на последней штуке: больше остатка сервер не примет. */
  disabled?: boolean
}) => {
  const { pressStyle, onPressIn, onPressOut } = usePressScale()

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={10}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      style={[pressStyle, disabled && styles.stepperDisabled]}
    >
      <Icon width={24} height={24} style={styles.icon} />
    </AnimatedPressable>
  )
}

const ProductScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const isGuest = useUserStore((s) => s.isGuest)
  const router = useRouter()
  const { data, isLoading, refetch } = productsApi.useGet(Number(id))
  const cartQuery = cartApi.useGetAll({ enabled: !isGuest })
  const items = useCartStore((s) => s.items)
  const { t, i18n } = useTranslation()
  const { add, update } = useCartActions({ t })
  const currentLang = useAppStore((s) => s.lang)
  const similarProductsQuery = productsApi.useGetSimilar(Number(id))
  const availabilityQuery = stockApi.useAvailability([Number(id)], {
    enabled: Number.isFinite(Number(id)),
  })
  const shopInfoSheetRef = useRef<TrueSheet>(null)

  const quantity = isGuest
    ? items.find((i) => i.productId === Number(id))?.quantity || 0
    : cartQuery.data?.groups.flatMap((g) => g.items).find((i) => i.product.id === Number(id))
        ?.quantity || 0

  useFocusEffect(
    useCallback(() => {
      refetch()
    }, [refetch]),
  )
  const shopAdditionalQuery = shopAdditionalApi.useGetByShopBaseId(data?.shop_base_id!, {
    enabled: !!data?.shop_base_id,
  })

  const similarProducts = useMemo(() => {
    return similarProductsQuery.data || []
  }, [similarProductsQuery.data])

  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false)
  const chevronRotation = useSharedValue(0)

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }))

  const toggleDescription = () => {
    chevronRotation.value = withTiming(isDescriptionOpen ? 0 : 90, {
      duration: 200,
    })
    setIsDescriptionOpen((prev) => !prev)
  }

  // Язык был захардкожен ("tk"): в русской локали название товара
  // показывалось по-туркменски. Берём перевод по текущему языку i18next,
  // с запасными вариантами (см. pickTranslation).
  const language = i18n.language || currentLang
  const name = pickTranslatedName(data?.translations, language)
  const description = pickTranslatedDescription(data?.translations, language)

  const onPressProduct = (id: number) => {
    router.push({ pathname: '/products/[id]', params: { id } })
  }

  const handlePressShopInfo = () => {
    shopInfoSheetRef.current?.present()
  }

  // --- Расчёт цены со скидкой ---
  const price = toMoneyNumber(data?.price)
  const discountValue = toMoneyNumber(data?.discount)
  // «Нет в наличии» — это не только надпись: класть такой товар в корзину
  // нельзя, иначе отказ придёт в конце оформления. Остатка в самом товаре нет,
  // он приходит отдельным запросом.
  const availability = availabilityQuery.data?.[0]
  const outOfStock = Boolean(availability?.tracked) && Number(availability?.available ?? 0) <= 0
  const isUnavailable = data?.is_active === false || outOfStock
  // Сколько ещё можно добавить: больше остатка сервер не примет.
  const maxQuantity = availability?.tracked ? Number(availability.available) : undefined
  const hasDiscount = !!data?.discount_type && discountValue > 0

  const finalPrice =
    data?.discount_type === 'percentage'
      ? price * (1 - discountValue / 100) // процент
      : price - discountValue // фиксированная СУММА скидки

  const discountPercent =
    data?.discount_type === 'percentage'
      ? Math.round(discountValue)
      : price > 0
        ? Math.round((discountValue / price) * 100) // сумма → процент
        : 0
  // --------------------------------
  // router.back() вызывался прямо в теле рендера — побочный эффект во время
  // отрисовки. Переносим в эффект.
  useEffect(() => {
    if (!id) router.back()
  }, [id, router])

  if (!id) return null

  return (
    <>
      <Header
        // В заголовке стоял сырой id товара («#16»). Показываем название на
        // текущем языке, пока грузится — нейтральное «Товар».
        title={name || t('product.title')}
        withGoBack
        backgroundColor="white"
      />
      {isLoading ? (
        <ActivityIndicator isFullScreen />
      ) : !data ? (
        // Раньше при пустом ответе экран оставался белым: заголовок «#undefined»
        // и пустая панель с ценой 0.00.
        <View style={styles.notFound}>
          <Typography variant="p2" weight="medium" color="secondary" isCentered>
            {t('product.notFound')}
          </Typography>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.wrapper}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.imageWrapper}>
              <ImagesList images={data?.images || []} />
            </View>
            <View style={styles.contentContainer}>
              <View style={styles.baseInfoContainer}>
                <View style={styles.card}>
                  <Typography variant="p2" weight="medium">
                    {name}
                  </Typography>
                </View>
                {/* Пустой аккордеон «Описание» раскрывался в никуда —
                    показываем блок, только когда описание реально есть. */}
                {!!description && (
                  <Animated.View layout={LinearTransition} style={styles.descriptionContainer}>
                    <Pressable onPress={toggleDescription} style={styles.descriptionHeader}>
                      <Typography weight="medium">{t('inputs.description')}</Typography>
                      <Animated.View style={chevronStyle}>
                        <RightChevronIcon width={20} height={20} style={styles.rightChevronIcon} />
                      </Animated.View>
                    </Pressable>

                    {isDescriptionOpen && (
                      <Animated.View
                        entering={FadeIn.duration(200)}
                        exiting={FadeOut.duration(150)}
                        style={styles.descriptionContent}
                      >
                        <Typography variant="p3">{description}</Typography>
                      </Animated.View>
                    )}
                  </Animated.View>
                )}
                {!!shopAdditionalQuery.data && (
                  <View style={styles.card}>
                    <View style={styles.shopInfoRow}>
                      <View style={styles.shopLogoContainer}>
                        <Image
                          style={styles.logoImage}
                          source={getImageUrl(shopAdditionalQuery.data?.logo_path)}
                          contentFit="contain"
                        />
                      </View>
                      <Typography weight="medium" variant="p2">
                        {shopAdditionalQuery.data?.name}
                      </Typography>
                    </View>
                    <Pressable onPress={handlePressShopInfo} hitSlop={10}>
                      <CircleInfoIcon width={24} height={24} style={styles.infoIcon} />
                    </Pressable>
                  </View>
                )}
              </View>

              {similarProducts.length > 0 && (
                <View style={styles.similarSection}>
                  <Typography variant="p2" weight="medium">
                    {t('product.similarProducts')}
                  </Typography>

                  <View style={styles.productsGrid}>
                    {similarProducts.slice(0, 6).map((item) => (
                      <ProductCard
                        key={item.id}
                        data={item}
                        withoutFavorite
                        isFavorite={false}
                        onToggleFavorite={() => {}}
                        currentLanguage={language}
                        onPress={() => onPressProduct(item.id)}
                        t={t}
                      />
                    ))}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
          <ScreenFooter>
            <View style={styles.footerContent}>
              <View style={styles.priceContainer}>
                {hasDiscount ? (
                  <>
                    <View style={styles.discountRow}>
                      <Typography variant="p1" weight="bold" color="error">
                        {formatMoney(finalPrice, data?.currency)}
                      </Typography>
                      {/* Бейдж рисовался только для процентной скидки —
                          скидка суммой оставалась без пометки. */}
                      {discountPercent > 0 && (
                        <DiscountPercentBadge discountPercent={discountPercent} />
                      )}
                    </View>
                    <Typography variant="t1" color="secondary" isLineThrough>
                      {formatMoney(price, data?.currency)}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="p1" weight="bold">
                    {formatMoney(price, data?.currency)}
                  </Typography>
                )}
              </View>

              {isUnavailable ? (
                <Button
                  title={t('product.outOfStock')}
                  disabled
                  style={styles.cartButton}
                  variant="primary"
                />
              ) : quantity === 0 ? (
                <Button
                  title={t('product.button')}
                  onPress={() => {
                    add(Number(id))
                  }}
                  style={styles.cartButton}
                  variant="primary"
                />
              ) : (
                <View style={styles.quantityContainer}>
                  <StepperButton
                    onPress={() => update(Number(id), quantity - 1)}
                    Icon={MinusIcon}
                  />
                  <Typography variant="p1" weight="semiBold" color="white">
                    {quantity}
                  </Typography>
                  <StepperButton
                    onPress={() => update(Number(id), quantity + 1)}
                    Icon={PlusIcon}
                    disabled={maxQuantity !== undefined && quantity >= maxQuantity}
                  />
                </View>
              )}
            </View>
          </ScreenFooter>

          <ShopInfoSheet
            phoneNumber={Number(
              shopAdditionalQuery.data && shopAdditionalQuery.data?.phone_numbers
                ? shopAdditionalQuery.data?.phone_numbers[0]
                : 0,
            )}
            description={shopAdditionalQuery.data?.description || ''}
            ref={shopInfoSheetRef}
            t={t}
          />
        </>
      )}
    </>
  )
}

export default ProductScreen

const styles = StyleSheet.create((theme) => ({
  contentContainer: {
    gap: theme.spacing(4),
    padding: theme.spacing(2),
  },
  wrapper: {
    flex: 1,
  },
  // Контент упирался прямо в закреплённую панель с ценой: последняя карточка
  // обрезалась её скруглением и тенью — выглядело как наезжающая панель.
  scrollContent: {
    paddingBottom: theme.spacing(4),
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(6),
  },
  similarSection: {
    gap: theme.spacing(4),
  },
  card: {
    flex: 1,
    padding: theme.spacing(3),
    gap: theme.spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing(3),
  },
  descriptionContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing(3),
    overflow: 'hidden',
  },
  descriptionHeader: {
    padding: theme.spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  descriptionContent: {
    paddingHorizontal: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  },
  baseInfoContainer: {
    gap: theme.spacing(2),
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 7 / 8,
    backgroundColor: theme.colors.white,
  },
  shopLogoContainer: {
    width: 90,
    height: 50,
    justifyContent: 'center',
    backgroundColor: theme.colors.gray2,
    borderRadius: theme.spacing(3),
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  logoImage: {
    width: 90,
    aspectRatio: 50 / 20,
  },
  infoIcon: {
    color: theme.colors.passive1,
  },
  // Был theme.colors.stroke — на белой карточке шеврон практически не видно.
  rightChevronIcon: {
    color: theme.colors.passive1,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(3),
  },
  // Без flexShrink длинная цена выдавливала кнопку «в корзину» за экран.
  priceContainer: {
    flexShrink: 1,
    gap: theme.spacing(0.5),
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
  },
  stepperDisabled: {
    opacity: 0.4,
  },
  cartButton: {
    flex: 1,
  },
  quantityContainer: {
    flex: 1,
    height: 48,
    paddingHorizontal: theme.spacing(4),
    borderRadius: theme.spacing(3),
    backgroundColor: theme.colors.blueMain,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    color: theme.colors.white,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
  },
  shopInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
}))
