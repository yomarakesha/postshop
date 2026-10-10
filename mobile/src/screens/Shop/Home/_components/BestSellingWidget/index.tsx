import React from 'react'
import Typography from '@/ui/Typography'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import ProductCard from './ProductCard'
import { TFunction } from 'i18next'
import ActivityIndicator from '@/ui/ActivityIndicator'

type Props = {
  data: Order.API.GetTopProductsResponse
  isLoading?: boolean
  t: TFunction
}

const BestSellingWidget = ({ data, isLoading = false, t }: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.headline}>
        <Typography variant="p2" weight="semiBold">
          {t('store.home.bestSelling')}
        </Typography>
      </View>
      <View style={styles.productsWrapper}>
        {isLoading ? (
          <ActivityIndicator />
        ) : data.length === 0 ? (
          <Typography variant="p3" color="tertiary" isCentered>
            {t('store.home.bestSellingEmpty')}
          </Typography>
        ) : (
          data.map((item) => (
            <ProductCard
              key={item.product.id}
              product={item.product}
              totalRevenue={item.total_revenue}
            />
          ))
        )}
      </View>
    </View>
  )
}

export default BestSellingWidget

const styles = StyleSheet.create((theme) => ({
  container: {
    borderRadius: theme.spacing(3),
    borderWidth: 1,
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.stroke,
    ...theme.shadows.hard,
  },
  headline: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.stroke,
    padding: theme.spacing(4),
  },
  productsWrapper: {
    gap: theme.spacing(4),
    padding: theme.spacing(4),
  },
}))
