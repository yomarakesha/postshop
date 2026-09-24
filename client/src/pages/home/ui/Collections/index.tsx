import { useTranslation } from 'react-i18next'
import { CollectionSection } from './ui/CollectionSection'
import { REFERENCE_LIST_LIMIT } from '#/shared/constants/pagination'

import {
  useGetCollectionsCollectionsGet,
  useGetShopAdditionalsShopAdditionalsGet,
} from '#/shared/openapi/queries/queries'
import { ProductCardSkeleton } from '#/widgets/ProductCard/ui/ProductCardSkeleton'

export const Collections = () => {
  const { i18n } = useTranslation()
  const { data: collections, isLoading } = useGetCollectionsCollectionsGet({
    query: { products_limit: 12 },
  })
  const { data: shopAdditionals } = useGetShopAdditionalsShopAdditionalsGet({
    query: { limit: REFERENCE_LIST_LIMIT },
  })

  const shopNamesMap = new Map<number, string>()

  if (shopAdditionals) {
    for (const shop of shopAdditionals) {
      if (shop.name) {
        shopNamesMap.set(shop.shop_base_id, shop.name)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 sidebar:grid-cols-3 wide:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  const activeCollections = collections?.filter((collection) => collection.is_active)

  if (!activeCollections || activeCollections.length === 0) return null

  return (
    <>
      {activeCollections.map((collection) => (
        <CollectionSection
          key={collection.id}
          collection={collection}
          language={i18n.language}
          shopNamesMap={shopNamesMap}
        />
      ))}
    </>
  )
}
