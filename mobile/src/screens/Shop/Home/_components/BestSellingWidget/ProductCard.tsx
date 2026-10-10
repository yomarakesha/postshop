import Typography from '@/ui/Typography'
import { formatMoney } from '@/utils/formatMoney'
import { getImageUrl } from '@/utils/getImageUrl'
import { Image } from 'expo-image'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

type ProductCardProps = {
  product: Product.Item
  totalRevenue: string
}

const ProductCard = ({ product, totalRevenue }: ProductCardProps) => {
  return (
    <View style={styles.productsContainer}>
      <Image source={getImageUrl(product.images?.[0])} contentFit="contain" style={styles.image} />
      <View style={styles.info}>
        <Typography variant="p3" weight="medium" numberOfLines={2}>
          {product.translations?.[0]?.name ?? ''}
        </Typography>
      </View>

      <Typography variant="p3" weight="medium" color="secondary" numberOfLines={1}>
        {formatMoney(totalRevenue, product.currency)}
      </Typography>
    </View>
  )
}

export default ProductCard

const styles = StyleSheet.create((theme) => ({
  productsContainer: {
    gap: theme.spacing(3),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  image: {
    width: 46,
    height: 46,
    borderRadius: theme.spacing(2),
    backgroundColor: theme.colors.gray2,
  },
  info: {
    flex: 1,
  },
}))
