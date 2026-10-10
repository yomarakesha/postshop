import { productsApi } from '@/api/products'
import { stockApi } from '@/api/stockApi'
import useAppStore from '@/store/useAppStore'
import ActivityIndicator from '@/ui/ActivityIndicator'
import Button from '@/ui/Button'
import EmptyState from '@/ui/EmptyState'
import RefreshControl from '@/ui/RefreshControl'
import Typography from '@/ui/Typography'
import { pickTranslatedName } from '@/utils/pickTranslation'
import { TFunction } from 'i18next'
import React, { ReactElement, useMemo } from 'react'
import { FlatList, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { StockTarget } from './StockSheet'

type Props = {
  shopId: number
  t: TFunction
  /** Кнопка у строки; без неё список только показывает остаток. */
  action?: { title: string; onPress: (target: StockTarget) => void }
  /**
   * Дополнительные кнопки — например, «История» и «Забрать». `isVisible`
   * прячет кнопку там, где действие бессмысленно (забрать нечего).
   */
  extraActions?: {
    title: string
    onPress: (target: StockTarget) => void
    isVisible?: (target: StockTarget) => boolean
  }[]
  ListHeaderComponent?: ReactElement
}

/**
 * Товары магазина с доступным остатком — общий список для «Остатков» и
 * «Приёма товара» (FBS) и для «Склада» (FBO). Как на витрине
 * (`widgets/ShopStockList`).
 *
 * Остаток считает сервер по журналу нужного типа — магазина для FBS, складов
 * платформы для FBO — и вычитает то, что уже держат открытые заказы.
 */
const ShopStockList = ({ shopId, t, action, extraActions, ListHeaderComponent }: Props) => {
  const language = useAppStore((s) => s.lang)
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage, isRefetching, refetch } =
    productsApi.useGetMyInfiniteList({
      limit: 20,
      skip: 0,
      shop_base_id: shopId,
    })

  const products = useMemo(() => data?.pages.flat() ?? [], [data])
  const productIds = useMemo(() => products.map((p) => p.id), [products])
  const availabilityQuery = stockApi.useAvailability(productIds)
  const stockById = useMemo(
    () => new Map((availabilityQuery.data ?? []).map((a) => [a.product_id, a])),
    [availabilityQuery.data],
  )

  const renderItem = ({ item: product }: { item: Product.Item }) => {
    const available = Number(stockById.get(product.id)?.available ?? 0)
    const name = pickTranslatedName(product.translations, language)
    const target: StockTarget = {
      productId: product.id,
      measureUnitId: product.measure_unit_id,
      name,
      available,
    }
    const extras = (extraActions ?? []).filter(
      (extra) => !extra.isVisible || extra.isVisible(target),
    )
    return (
      <View style={styles.row}>
        <View style={styles.flex1}>
          <Typography variant="p3" weight="medium" numberOfLines={2}>
            {name}
          </Typography>
          <Typography
            variant="t1"
            weight={available > 0 ? undefined : 'medium'}
            color={available > 0 ? 'secondary' : 'error'}
          >
            {available > 0
              ? t('store.stock.available', { count: available })
              : t('product.outOfStock')}
          </Typography>
        </View>
        <View style={styles.actions}>
          {extras.map((extra) => (
            <Button
              key={extra.title}
              title={extra.title}
              variant="secondary"
              style={styles.button}
              onPress={() => extra.onPress(target)}
            />
          ))}
          {action && (
            <Button
              title={action.title}
              variant="secondary"
              style={styles.button}
              onPress={() => action.onPress(target)}
            />
          )}
        </View>
      </View>
    )
  }

  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={(product) => String(product.id)}
      // Кнопка у строки зависит от остатка — перерисовываем, когда он пришёл.
      extraData={stockById}
      style={styles.flex1}
      contentContainerStyle={styles.content}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={
        isLoading ? (
          <ActivityIndicator isFullScreen />
        ) : (
          <EmptyState title={t('store.myProducts.empty.title')} />
        )
      }
      ListFooterComponent={isFetchingNextPage ? <ActivityIndicator /> : null}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage()
      }}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => {
            refetch()
            availabilityQuery.refetch()
          }}
        />
      }
    />
  )
}

export default ShopStockList

const styles = StyleSheet.create((theme) => ({
  flex1: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(4),
    gap: theme.spacing(2),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(3),
    padding: theme.spacing(3),
    borderRadius: theme.radius.base,
    backgroundColor: theme.colors.white,
  },
  // Кнопки столбиком: в ряд с названием товара две-три не помещаются.
  actions: {
    gap: theme.spacing(1),
  },
  button: {
    minHeight: theme.spacing(10),
    paddingVertical: theme.spacing(2),
    paddingHorizontal: theme.spacing(3),
  },
}))
