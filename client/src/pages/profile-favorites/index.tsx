import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Heart } from 'lucide-react'
import { EmptyState } from '#/shared/ui/EmptyState'
import { REFERENCE_LIST_LIMIT } from '#/shared/constants/pagination'
import { ProductCard } from '@/widgets/ProductCard'
import { ProductCardSkeleton } from '#/widgets/ProductCard/ui/ProductCardSkeleton'
import { useFavoritesContext } from '#/app/providers/FavoritesProvider'
import { useGetShopAdditionalsShopAdditionalsGet } from '#/shared/openapi/queries'
import { getDiscountInfo } from '#/shared/utils/discount'

export const FavoritesPage = () => {
  const { i18n, t } = useTranslation()
  const { favorites } = useFavoritesContext()
  const { data: shopAdditionals } = useGetShopAdditionalsShopAdditionalsGet({
    query: { limit: REFERENCE_LIST_LIMIT },
  })

  const shopNamesMap = useMemo(() => {
    const map = new Map<number, string>()
    if (shopAdditionals) {
      for (const shop of shopAdditionals) {
        map.set(shop.shop_base_id, shop.name || '')
      }
    }
    return map
  }, [shopAdditionals])

  if (!favorites) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <EmptyState
        variant="plain"
        icon={<Heart size={48} strokeWidth={1.5} />}
        title={t('favorites.empty')}
      />
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {favorites.map((fav) => {
        const product = fav.product
        const { price, discountPercent, oldPrice } = getDiscountInfo(
          Number(product.price),
          product.discount,
          product.discount_type,
        )
        const translations = product.translations
        const name =
          translations.find((tr) => tr.language === i18n.language)?.name ||
          translations[0]?.name ||
          ''

        return (
          <ProductCard
            key={product.id}
            productId={product.id}
            images={product.images ?? []}
            price={price}
            oldPrice={oldPrice}
            name={name}
            store={shopNamesMap.get(product.shop_base_id) ?? ''}
            storeTo={`/stores/${product.shop_base_id}`}
            discount={discountPercent}
            outOfStock={!product.is_active}
            currencyCode={product.currency?.code}
            rating={product.rating_avg}
            ratingCount={product.rating_count}
            to={`/${product.id}`}
          />
        )
      })}
    </div>
  )
}
