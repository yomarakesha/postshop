import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import type { CollectionResponse, ProductResponse } from '#/shared/openapi/requests/types.gen'
import { ProductCard } from '@/widgets/ProductCard'
import { Button } from '#/shared/ui/Button'
import { getDiscountInfo } from '#/shared/utils/discount'

const getCollectionName = (translations: CollectionResponse['translations'], language: string) => {
  return translations.find((t) => t.language === language)?.name ?? translations[0]?.name
}

const getProductName = (translations: ProductResponse['translations'], language: string) => {
  return translations.find((t) => t.language === language)?.name ?? translations[0]?.name
}

export const CollectionSection = ({
  collection,
  language,
  shopNamesMap,
}: {
  collection: CollectionResponse
  language: string
  shopNamesMap: Map<number, string>
}) => {
  const { t } = useTranslation()
  const products = collection.products
  const navigate = useNavigate()

  if (products.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      <h2 className="p2 font-bold">{getCollectionName(collection.translations, language)}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 sidebar:grid-cols-3 wide:grid-cols-4 gap-2 md:gap-4">
        {products.map((product) => {
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
              name={getProductName(product.translations, language)}
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
      {collection.products.length >= 12 && (
        <div className="flex justify-center">
          <Button
            size="sm"
            /* max-w-37.5 обрезал кнопку по ширине, и подпись в туркменском и
               русском переносилась на вторую строку, а в английском нет.
               Кнопка растягивается по тексту, перенос запрещён. */
            className="t1 whitespace-nowrap bg-white font-bold text-blue-main"
            onClick={() =>
              navigate({
                to: '/collections/$collectionId',
                params: { collectionId: String(collection.id) },
              })
            }
          >
            {t('collections.seeAll')}
          </Button>
        </div>
      )}
    </div>
  )
}
