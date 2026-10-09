import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PackageX } from 'lucide-react'
import { StoreInfoModal } from '../../widgets/StoreCard/ui/StoreInfoModal'
import { FilterSidebar } from './ui/FilterSidebar'
import type { SortOption } from '../../widgets/Filters/SortFilter'
import type { PriceRange } from '../../widgets/Filters/PriceRangeFilter'
import type { ModalRef } from '#/shared/ui/Modal'
import { Breadcrumbs } from '#/shared/ui/Breadcrumbs'
import { EmptyState } from '#/shared/ui/EmptyState'
import { ProductCard } from '#/widgets/ProductCard'
import {
  useGetProductsProductsGet,
  useGetShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGet,
} from '#/shared/openapi/queries'
import { getImageUrl } from '#/shared/utils/getImageUrl'
import { getDiscountInfo } from '#/shared/utils/discount'

import ApprovedIcon from '#/shared/assets/icons/approved.svg?react'
import InfoIcon from '#/shared/assets/icons/info.svg?react'
import { ProductCardSkeleton } from '#/widgets/ProductCard/ui/ProductCardSkeleton'
import { getTranslatedName } from '#/shared/utils/getTranslatedName'
import { useOutOfStock } from '#/shared/hooks/useStockAvailability'

interface StoreIdPageProps {
  storeId: string
}

export const StoreIdPage = ({ storeId }: StoreIdPageProps) => {
  const modalRef = useRef<ModalRef>(null)
  const { t, i18n } = useTranslation()
  const shopId = Number(storeId)
  const [sort, setSort] = useState<SortOption>()
  const [priceRange, setPriceRange] = useState<PriceRange>({})
  const [selectedBrands, setSelectedBrands] = useState<Array<number>>([])

  const { data: shopAdditional, isLoading: isShopLoading } =
    useGetShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGet({
      path: { shop_base_id: shopId },
    })

  const { data: products, isLoading: isProductsLoading } = useGetProductsProductsGet({
    query: {
      shop_base_ids: [shopId],
      brand_ids: selectedBrands.length > 0 ? selectedBrands : undefined,
      sort,
      price_from: priceRange.priceFrom,
      price_to: priceRange.priceTo,
    },
  })

  const isOutOfStockProduct = useOutOfStock(products)
  const hasFilters =
    selectedBrands.length > 0 || Boolean(priceRange.priceFrom) || Boolean(priceRange.priceTo)

  const storeName = shopAdditional?.name ?? ''
  const storeLogo = getImageUrl(shopAdditional?.logo_path)
  const storeColor = shopAdditional?.color ?? '#FF4E03'
  const storeColorText = shopAdditional?.color_text ?? '#FFFFFF'
  const storeDescription = shopAdditional?.description ?? ''
  const storePhones = shopAdditional?.phone_numbers ?? []
  const storeAddresses = shopAdditional?.addresses ?? []

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        items={[
          { label: t('breadcrumbs.home'), to: '/' },
          { label: t('breadcrumbs.stores'), to: '/stores' },
          { label: storeName },
        ]}
      />
      <div className="flex gap-8">
        <FilterSidebar
          sort={sort}
          onSortChange={setSort}
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
          selectedBrands={selectedBrands}
          onBrandsChange={setSelectedBrands}
        />
        <div className="flex-1">
          {isShopLoading ? (
            <div className="h-20 animate-pulse rounded-base bg-gray-200" />
          ) : (
            <div className="p-3 rounded-base flex gap-4" style={{ backgroundColor: storeColor }}>
              {/* Высота постоянная, ширина по пропорциям логотипа: в квадрате
                  64×64 широкий логотип сжимался в тонкую полоску посередине. */}
              <div className="flex shrink-0 items-center overflow-hidden rounded-base bg-white">
                <img
                  src={storeLogo}
                  alt={storeName}
                  className="h-16 w-auto min-w-16 max-w-40 object-contain"
                />
              </div>
              <div className="flex flex-1 items-center justify-between">
                <div className="flex flex-col gap-3">
                  <span className="flex gap-1 items-center">
                    <h3 className="p1 font-semibold" style={{ color: storeColorText }}>
                      {storeName}
                    </h3>
                    <ApprovedIcon />
                  </span>
                </div>
                <button onClick={() => modalRef.current?.open()}>
                  <InfoIcon color="#F5F7FA" />
                </button>

                <StoreInfoModal
                  ref={modalRef}
                  name={storeName}
                  logo={storeLogo}
                  description={storeDescription}
                  phones={storePhones}
                  addresses={storeAddresses}
                />
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-6 content-start">
            {isProductsLoading &&
              Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            {products?.map((product) => {
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
                  store={storeName}
                  discount={discountPercent}
                  name={getTranslatedName(product.translations, i18n.language)}
                  outOfStock={isOutOfStockProduct(product)}
                  currencyCode={product.currency?.code}
                  rating={product.rating_avg}
                  ratingCount={product.rating_count}
                  to={`/stores/${storeId}/${product.id}`}
                  storeTo={`/stores/${storeId}`}
                />
              )
            })}
          </div>
          {/* Пустую выдачу раньше ничем не объясняли: оставалась пустая сетка.
              С фильтром пишем про фильтр — товары есть, их скрыл он. */}
          {!isProductsLoading && products?.length === 0 && (
            <EmptyState
              icon={<PackageX size={40} strokeWidth={1.5} />}
              title={t(hasFilters ? 'categories.filteredEmpty' : 'categories.storeEmpty')}
              hint={hasFilters ? t('categories.filteredEmptyHint') : undefined}
            />
          )}
        </div>
      </div>
    </div>
  )
}
