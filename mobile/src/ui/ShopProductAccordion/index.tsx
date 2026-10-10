import useCartActions from '@/hooks/useCartActions'
import DiscountPercentBadge from '@/ui/Badges/DiscountPercent'
import Typography from '@/ui/Typography'
import { formatMoney } from '@/utils/formatMoney'
import { getImageUrl } from '@/utils/getImageUrl'
import MinusIcon from '@assets/icons/minus.svg'
import PlusIcon from '@assets/icons/plus.svg'
import RightChevronIcon from '@assets/icons/right-chevron.svg'
import { Image } from 'expo-image'
import React, { useState } from 'react'
import { Pressable, TouchableOpacity, View } from 'react-native'
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { StyleSheet } from 'react-native-unistyles'
import { CartData } from '../../hooks/useCartData'
import { TFunction } from 'i18next'

type Props = {
  data: CartData
  language: AppLang
  t: TFunction
}

const ShopProductsAccordion = ({ data, language, t }: Props) => {
  const [isOpen, setIsOpen] = useState(true)
  const chevronRotation = useSharedValue(isOpen ? 90 : 0)
  const { update } = useCartActions({ t })

  const toggleAccordion = () => {
    chevronRotation.value = withTiming(isOpen ? 0 : 90, { duration: 300 })
    setIsOpen((prev) => !prev)
  }

  const animatedChevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }))

  const getProductTranslation = (translations: Product.Translation[]) => {
    const current = translations.find(
      (translation) => translation.language === (language as string),
    )

    return current || translations[0]
  }

  return (
    <Animated.View layout={LinearTransition} style={styles.container}>
      <TouchableOpacity style={styles.header(isOpen)} onPress={toggleAccordion} activeOpacity={0.7}>
        <View style={styles.headerRight}>
          <View style={styles.imageContainer}>
            <Image source={getImageUrl(data.logo_path)} style={styles.image} contentFit="contain" />
          </View>
          <Typography variant="p3" weight="semiBold">
            {data.shopBaseName + ' (' + data.totalItems + ')'}
          </Typography>
        </View>

        <Animated.View style={animatedChevronStyle}>
          <RightChevronIcon width={20} height={20} style={styles.chevronIcon} />
        </Animated.View>
      </TouchableOpacity>

      {isOpen && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          layout={LinearTransition}
          style={styles.content}
        >
          {data.products.map((product) => {
            const price = Number(product.price ?? 0)
            const discountValue = Number(product.discount ?? 0)
            const hasDiscount = !!product.discount_type && discountValue > 0

            return (
              <View key={String(product.id)} style={styles.productContainer}>
                <Image source={getImageUrl(product.images[0])} style={styles.productImage} />
                <View style={styles.prouctInfoContainer}>
                  <Typography variant="p3">
                    {getProductTranslation(product.translations).name}
                  </Typography>
                  <View style={styles.productPriceQuantityRow}>
                    <View style={styles.productPrice}>
                      {hasDiscount && (
                        <View style={styles.discountContainer}>
                          <Typography variant="p3" weight="medium" color="error">
                            {formatMoney(product.finalPrice, product.currency)}
                          </Typography>
                          {product.discount_type === 'percentage' && (
                            <DiscountPercentBadge discountPercent={discountValue} />
                          )}
                        </View>
                      )}
                      <Typography
                        variant={hasDiscount ? 't1' : 'p2'}
                        color={hasDiscount ? 'secondary' : undefined}
                        isLineThrough={hasDiscount}
                      >
                        {formatMoney(price, product.currency)}
                      </Typography>
                    </View>
                    <View style={styles.quantityContainer}>
                      <Pressable
                        hitSlop={8}
                        onPress={() => update(product.id, product.quantity - 1)}
                      >
                        <MinusIcon width={20} height={20} style={styles.icon} />
                      </Pressable>
                      <Typography
                        variant="p3"
                        weight="semiBold"
                        color="main"
                        style={styles.quantityValue}
                      >
                        {product.quantity}
                      </Typography>
                      <Pressable
                        hitSlop={8}
                        onPress={() => update(product.id, product.quantity + 1)}
                      >
                        <PlusIcon width={20} height={20} style={styles.icon} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            )
          })}
          <View style={styles.priceBottomContainer}>
            <Typography variant="p2" weight="semiBold" style={styles.label}>
              {t('client.cart.footer.totalPrice')}
            </Typography>
            <Typography variant="p2" weight="semiBold" style={styles.value}>
              {formatMoney(data.shopTotalPrice, data.products[0]?.currency)}
            </Typography>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  )
}

export default ShopProductsAccordion

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.base,
    overflow: 'hidden',
    padding: theme.spacing(3),
  },
  header: (isOpen: boolean) => ({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: isOpen ? 1 : 0,
    borderBottomColor: theme.colors.stroke,
    paddingBottom: isOpen ? theme.spacing(2) : 0,
  }),
  imageContainer: {
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    borderRadius: theme.radius.base,
    // Без обрезки логотип магазина торчал прямыми углами из скруглённой рамки.
    overflow: 'hidden',
    // Рамка была 85x50 — прямоугольник под квадратные логотипы магазинов:
    // широкий чёрный или жёлтый фон растягивался на всю плашку и в шапке
    // группы читался как баннер, а не как аватар. Квадрат 1:1.
    width: 48,
    height: 48,
    // Логотип не упирается в рамку — иначе его края сливаются с обводкой.
    padding: theme.spacing(1),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  chevronIcon: {
    color: theme.colors.passive1,
  },
  content: {
    width: '100%',
    gap: theme.spacing(2),
  },
  productContainer: {
    paddingVertical: theme.spacing(2),
    flexDirection: 'row',
    gap: theme.spacing(4),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.stroke,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: theme.spacing(1),
  },
  prouctInfoContainer: {
    flex: 1,
    gap: theme.spacing(2),
  },
  productPriceQuantityRow: {
    flexDirection: 'row',
    gap: theme.spacing(2),
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    flexShrink: 1,
    gap: theme.spacing(1),
  },
  discountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
  },
  quantityContainer: {
    flexShrink: 0,
    // Счётчик был крупнее фотографии товара (40 px в высоту, 24 px иконки,
    // число размером с заголовок) и перетягивал на себя всю карточку.
    // Размеры приведены к счётчику корзины витрины: мелкая плашка сбоку.
    paddingVertical: theme.spacing(1),
    paddingHorizontal: theme.spacing(2),
    borderRadius: theme.radius.base,
    backgroundColor: theme.colors.blue2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  quantityValue: {
    // Фиксированная ширина числа: без неё плашка прыгала при переходе 9 -> 10.
    minWidth: 20,
    textAlign: 'center',
  },
  icon: {
    color: theme.colors.blueMain,
  },
  priceBottomContainer: {
    paddingTop: theme.spacing(3),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing(3),
  },
  label: {
    flexShrink: 1,
  },
  value: {
    flexShrink: 0,
    textAlign: 'right',
  },
}))
