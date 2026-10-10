import { cartApi } from '@/api/cartApi'
import Header from '@/components/Header'
import useAppStore from '@/store/useAppStore'
import { useCartStore } from '@/store/useCartStore'
import { useConfirmationModal } from '@/store/useConfirmationModal'
import { useUserStore } from '@/store/useUserStore'
import ActivityIndicator from '@/ui/ActivityIndicator'
import ScreenFooter from '@/ui/ScreenFooter'
import Typography from '@/ui/Typography'
import CircleInfoIcon from '@assets/icons/circle-info.svg'
import LoginIcon from '@assets/icons/log-in.svg'
import emptyCartImage from '@assets/images/empty-cart.png'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import useCartData from '@/hooks/useCartData'
import ShopProductsAccordion from '@/ui/ShopProductAccordion'
import HeaderRight from './_components/HeaderRight'
import PriceSummary from '@/ui/PriceSummary'

const CartScreen = () => {
  const currentLanguage = useAppStore((s) => s.lang)
  const isGuest = useUserStore((s) => s.isGuest)
  const clearCartMutation = cartApi.useClear()
  const { t } = useTranslation()
  const router = useRouter()
  const onDelete = () => {
    useConfirmationModal.setState({
      isOpen: true,
      title: t('client.cart.clearConfirm.title'),
      description: t('client.cart.clearConfirm.description'),
      Icon: CircleInfoIcon,
      type: 'warning',
      confirmTitle: t('common.clear'),
      cancelTitle: t('common.close'),
      onConfirm: async () => {
        if (isGuest) {
          useCartStore.getState().clearCart()
        } else {
          await clearCartMutation.mutateAsync()
        }
      },
    })
  }
  const { groups, price, discountPrice, total, isLoading, isError } = useCartData()

  // Валюта берётся из данных корзины, а не из захардкоженного «TMT».
  const currency = groups[0]?.products[0]?.currency

  const onSubmit = () => {
    if (isGuest) {
      useConfirmationModal.setState({
        isOpen: true,
        title: t('client.cart.loginRequired.title'),
        description: t('client.cart.loginRequired.description'),
        okTitle: t('common.close'),
        Icon: LoginIcon,
        type: 'info',
        onConfirm: undefined,
      })
      return
    }
    router.push('/checkout')
  }

  return (
    <>
      <Header
        backgroundColor="white"
        headerRight={<HeaderRight onDelete={onDelete} isEmpty={groups.length === 0} />}
      />
      {isLoading ? (
        // Без этой ветки на время загрузки показывалась «пустая корзина»,
        // которая тут же сменялась списком товаров.
        <ActivityIndicator isFullScreen />
      ) : isError ? (
        <View style={styles.center}>
          <Typography variant="p1" weight="semiBold" style={styles.centerText}>
            {t('networkError.title')}
          </Typography>
          <Typography variant="t1" weight="medium" color="secondary" style={styles.centerHint}>
            {t('networkError.description')}
          </Typography>
        </View>
      ) : groups.length === 0 ? (
        <View style={styles.center}>
          <Image source={emptyCartImage} style={styles.emptyImage} />
          <Typography variant="p1" weight="semiBold" style={styles.centerText}>
            {t('emptyState.cart.title')}
          </Typography>
          <Typography variant="t1" weight="medium" color="secondary" style={styles.centerHint}>
            {t('emptyState.cart.description')}
          </Typography>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.flex1}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {groups.map((group) => (
              <ShopProductsAccordion
                key={String(group.shopBaseId)}
                data={group}
                language={currentLanguage!}
                t={t}
              />
            ))}
          </ScrollView>

          {/* Условие `groups.length > 0` здесь было лишним: эта ветка и так
              рисуется только когда корзина не пуста. */}
          <ScreenFooter>
            {/* Ссылки «О доставке» здесь больше нет: на витрине условия
                доставки показываются один раз, на оформлении заказа
                (pages/checkout). В приложении она стояла ещё и в корзине —
                вплотную над кнопкой заказа, споря с ней за внимание. */}
            <PriceSummary
              price={price}
              discountPrice={discountPrice}
              total={total}
              onSubmit={onSubmit}
              // Как в корзине витрины: обе цены на кнопке, разбивки над ней
              // нет вовсе. Оформление заказа устроено иначе — там витрина
              // разбивку показывает.
              totalInButton
              withoutSummary
              currency={currency}
              t={t}
            />
          </ScreenFooter>
        </>
      )}
    </>
  )
}

export default CartScreen

const styles = StyleSheet.create((theme) => ({
  flex1: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing(8),
  },
  centerText: {
    marginTop: theme.spacing(6),
    textAlign: 'center',
  },
  centerHint: {
    marginTop: theme.spacing(2),
    textAlign: 'center',
  },
  contentContainer: {
    padding: theme.spacing(4),
    // Запас снизу, чтобы последняя карточка не упиралась в скруглённый край
    // закреплённой панели с итогами.
    paddingBottom: theme.spacing(6),
    gap: theme.spacing(2),
  },
  emptyImage: {
    width: 120,
    aspectRatio: 1,
  },
}))
