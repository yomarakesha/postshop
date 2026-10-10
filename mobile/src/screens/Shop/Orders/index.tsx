import { MAX_PAGE_SIZE } from '@/constants/pagination'
import React, { useMemo } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import noOrderImage from '@assets/images/no-order.png'
import Header from '@/components/Header'
import Typography from '@/ui/Typography'
import { useTranslation } from 'react-i18next'
import { orderApi } from '@/api/orderApi'
import { formatApiDateTimeNumeric, getAshgabatParts } from '@/utils/formatDate'
import { ScrollView } from 'react-native-gesture-handler'
import RefreshControl from '@/ui/RefreshControl'
import { useRouter } from 'expo-router'
import { Image } from 'expo-image'
import useShopStore from '@/store/useShopStore'
import Card from './_components/Card'
import ActivityIndicator from '@/ui/ActivityIndicator'
import { orderStatus } from '@/utils/orderStatus'

type OrderMonthGroup = {
  key: string
  monthKey: number
  year: number
  items: Order.Item[]
}

const groupByMonth = (orders: Order.Item[]): OrderMonthGroup[] => {
  const map = new Map<string, OrderMonthGroup>()
  for (const order of orders) {
    // Месяц — по Ашхабаду: заказ 1-го числа в 02:00 по-местному в UTC ещё
    // прошлый месяц, и раньше он попадал не в ту группу.
    const parts = getAshgabatParts(order.created_at)
    const monthKey = parts?.month ?? 0
    const year = parts?.year ?? 0
    const key = `${year}-${monthKey}`
    if (!map.has(key)) {
      map.set(key, { key, monthKey, year, items: [] })
    }
    map.get(key)!.items.push(order)
  }
  return Array.from(map.values())
}

const OrdersScreen = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const shop = useShopStore((s) => s.shop)
  const ordersQuery = orderApi.useGetShopOrders(
    shop?.shop_base_id!,
    {
      sort: 'newest',
      skip: 0,
      limit: MAX_PAGE_SIZE,
    },
    !!shop?.id,
  )

  const orders = useMemo(() => {
    return ordersQuery.data ?? []
  }, [ordersQuery.data])

  const groupedByMonth = groupByMonth(orders)

  // Вместе со списком — и значок на вкладке: потянул список вниз, значит
  // хочешь видеть актуальное везде.
  const attentionQuery = orderApi.useGetAttentionCount(shop?.shop_base_id)

  const onRefresh = () => {
    ordersQuery.refetch()
    attentionQuery.refetch()
  }

  const handleClickOrder = (id: number) => {
    router.push(`/(shop-tabs)/(orders)/order/${id}`)
  }

  return (
    <>
      <Header title={t('store.orders.headerTitle')} backgroundColor="white" />
      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={ordersQuery.isLoading} onRefresh={onRefresh} />}
      >
        {ordersQuery.isLoading ? (
          <ActivityIndicator isFullScreen />
        ) : groupedByMonth.length > 0 ? (
          groupedByMonth.map((item) => (
            <View key={item.key} style={styles.container}>
              <Typography color="secondary" weight="semiBold">
                {t(`months.${item.monthKey}`)} {item.year}
              </Typography>
              {item.items.map((el) => {
                // find() мог не найти магазин (заказ из другой витрины) —
                // "!" на результате роняло весь экран заказов.
                const orderShop = el.order_shops.find((s) => s.shop_base_id === shop?.shop_base_id)
                if (!orderShop) return null

                return (
                  <Card
                    key={String(el.id)}
                    id={el.id}
                    onPress={handleClickOrder}
                    date={formatApiDateTimeNumeric(el.created_at)}
                    view={orderStatus.seller.getView(el, orderShop)}
                    needsAction={orderStatus.seller.needsAction(el, orderShop)}
                    price={orderShop.subtotal}
                    t={t}
                  />
                )
              })}
            </View>
          ))
        ) : (
          <View style={styles.center}>
            <Image source={noOrderImage} style={styles.image} />
            <Typography variant="p1" weight="semiBold" isCentered>
              {t('emptyState.orders.title')}
            </Typography>
            <Typography variant="t1" weight="medium" color="secondary" isCentered>
              {t('emptyState.orders.description')}
            </Typography>
          </View>
        )}
      </ScrollView>
    </>
  )
}

export default OrdersScreen

const styles = StyleSheet.create((theme) => ({
  flex1: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(6),
    gap: theme.spacing(4),
  },
  image: {
    width: 130,
    height: 100,
    marginBottom: theme.spacing(4),
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // раньше отступы задавались инлайновыми marginTop: 24 / 8
    gap: theme.spacing(2),
    paddingHorizontal: theme.spacing(6),
  },
  container: {
    gap: theme.spacing(3),
  },
}))
