import { PackageOpen } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { CollectionResponse, ProductResponse } from '#/shared/openapi/requests/types.gen'
import { EmptyState } from '#/shared/ui/EmptyState'
import { REFERENCE_LIST_LIMIT } from '#/shared/constants/pagination'
import {
  useGetCollectionCollectionsCollectionIdGet,
  useGetShopAdditionalsShopAdditionalsGet,
} from '#/shared/openapi/queries/queries'
import { ProductCard } from '@/widgets/ProductCard'
import { CategoriesSidebar } from '@/widgets/CategoriesSidebar'
import { ProductCardSkeleton } from '#/widgets/ProductCard/ui/ProductCardSkeleton'
import { getDiscountInfo } from '#/shared/utils/discount'

const getCollectionName = (translations: CollectionResponse['translations'], language: string) => {
  return translations.find((t) => t.language === language)?.name ?? translations[0]?.name
}

const getProductName = (translations: ProductResponse['translations'], language: string) => {
  return translations.find((t) => t.language === language)?.name ?? translations[0]?.name
}

export const CollectionIdPage = ({ collectionId }: { collectionId: string }) => {
  const { t, i18n } = useTranslation()
  const { data: collection, isLoading } = useGetCollectionCollectionsCollectionIdGet({
    path: { collection_id: Number(collectionId) },
  })
  const { data: shopAdditionals } = useGetShopAdditionalsShopAdditionalsGet({
    query: { limit: REFERENCE_LIST_LIMIT },
  })

  const shopNamesMap = useMemo(() => {
    const map = new Map<number, string>()
    if (shopAdditionals) {
      for (const shop of shopAdditionals) {
        if (shop.name) map.set(shop.shop_base_id, shop.name)
      }
    }
    return map
  }, [shopAdditionals])

  return (
    <>
      <div className="flex gap-4">
        <CategoriesSidebar />
        <div className="flex-1 flex flex-col gap-6">
          {isLoading && (
            <>
              <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 sidebar:grid-cols-3 wide:grid-cols-4 gap-2 md:gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            </>
          )}
          {/* Несуществующая коллекция давала 404 от API, «Query data cannot be
              undefined» в консоли и пустую область без объяснения на экране. */}
          {!isLoading && !collection && (
            <div className="flex items-center justify-center py-20">
              <p className="text-passive2">{t('collections.notFound')}</p>
            </div>
          )}
          {collection && collection.products.length === 0 && (
            <EmptyState
              variant="plain"
              icon={<PackageOpen size={44} strokeWidth={1.5} />}
              title={t('collections.empty')}
            />
          )}
          {collection && (
            <>
              <h1 className="h3 font-bold">
                {getCollectionName(collection.translations, i18n.language)}
              </h1>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 sidebar:grid-cols-3 wide:grid-cols-4 gap-2 lg:gap-4">
                {collection.products.map((product) => {
                  const { price, discountPercent, oldPrice } = getDiscountInfo(
                    Number(product.price),
                    product.discount,
                    product.discount_type,
                  )

                  return (
                    <ProductCard
                      key={product.id}
                      productId={product.id}
                      images={product.images ?? []}
                      price={price}
                      oldPrice={oldPrice}
                      name={getProductName(product.translations, i18n.language)}
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
            </>
          )}
        </div>
      </div>
    </>
  )
}
