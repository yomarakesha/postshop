import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useInfiniteQuery } from '@tanstack/react-query'
import { FilterSidebar } from './ui/FilterSidebar'
import type { SortOption } from './ui/FilterSidebar/SortFilter'
import type { PriceRange } from './ui/FilterSidebar/PriceRangeFilter'
import { Breadcrumbs } from '#/shared/ui/Breadcrumbs'
import { ProductCard } from '#/widgets/ProductCard'
import { useGetBrandBrandsBrandIdGet } from '#/shared/openapi/queries'
import { UseGetProductsProductsGetKeyFn } from '#/shared/openapi/queries/common'
import { getProductsProductsGet } from '#/shared/openapi/requests/sdk.gen'
import { getImageUrl } from '#/shared/utils/getImageUrl'
import { ProductCardSkeleton } from '#/widgets/ProductCard/ui/ProductCardSkeleton'
import { getDiscountInfo } from '#/shared/utils/discount'
import { getTranslatedName } from '#/shared/utils/getTranslatedName'

const PAGE_SIZE = 24

interface BrandIdPageProps {
  brandId: string
}

export const BrandIdPage = ({ brandId }: BrandIdPageProps) => {
  const { t, i18n } = useTranslation()
  const loaderRef = useRef<HTMLDivElement>(null)
  const numericBrandId = Number(brandId)
  const [sort, setSort] = useState<SortOption>()
  const [priceRange, setPriceRange] = useState<PriceRange>({})
  const [selectedStores, setSelectedStores] = useState<Array<number>>([])

  const { data: brand, isLoading: isBrandLoading } = useGetBrandBrandsBrandIdGet({
    path: { brand_id: numericBrandId },
  })

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: [
      ...UseGetProductsProductsGetKeyFn({
        query: {
          brand_ids: [numericBrandId],
          sort,
          price_from: priceRange.priceFrom,
          price_to: priceRange.priceTo,
          shop_base_ids: selectedStores.length > 0 ? selectedStores : undefined,
        },
      }),
      'brand-infinite',
    ],
    queryFn: ({ pageParam = 0 }) =>
      getProductsProductsGet({
        query: {
          skip: pageParam,
          limit: PAGE_SIZE,
          brand_ids: [numericBrandId],
          shop_base_ids: selectedStores.length > 0 ? selectedStores : undefined,
          sort,
          price_from: priceRange.priceFrom,
          price_to: priceRange.priceTo,
        },
      }).then((res) => res.data ?? []),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length * PAGE_SIZE,
  })

  const products = data?.pages.flat()
  const brandName = brand?.name ?? ''
  const brandImage = getImageUrl(brand?.image_path)

  const handleObserver = useCallback(
    (entries: Array<IntersectionObserverEntry>) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  )

  useEffect(() => {
    const el = loaderRef.current
    if (!el) return
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [handleObserver])

  return (
    <div className="flex flex-col gap-6 min-w-0">
      <Breadcrumbs
        items={[
          { label: t('breadcrumbs.home'), to: '/' },
          { label: t('breadcrumbs.brands'), to: '/brands' },
          { label: isBrandLoading ? '...' : brandName },
        ]}
      />

      <div className="flex gap-8">
        <FilterSidebar
          brandImage={brandImage}
          sort={sort}
          onSortChange={setSort}
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
          selectedStores={selectedStores}
          onStoresChange={setSelectedStores}
        />
        <div className="flex flex-col w-full gap-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 content-start">
            {isLoading && Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
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
                  store={brandName}
                  discount={discountPercent}
                  name={getTranslatedName(product.translations, i18n.language)}
                  currencyCode={product.currency?.code}
                  rating={product.rating_avg}
                  ratingCount={product.rating_count}
                  to={`/brands/${brandId}/${product.id}`}
                  storeTo={`/brands/${brandId}`}
                />
              )
            })}
          </div>
          {isFetchingNextPage &&
            Array.from({ length: 3 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          {hasNextPage && <div ref={loaderRef} className="h-10" />}
        </div>
      </div>
    </div>
  )
}
