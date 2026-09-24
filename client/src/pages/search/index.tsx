import { SearchX } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useInfiniteQuery } from '@tanstack/react-query'
import { SearchFilterSidebar } from './ui/SearchFilterSidebar'
import type { SortOption } from '#/widgets/Filters/SortFilter'
import type { PriceRange } from '#/widgets/Filters/PriceRangeFilter'
import type { SearchSearchGetData } from '#/shared/openapi/requests/types.gen'
import { EmptyState } from '#/shared/ui/EmptyState'
import { Breadcrumbs } from '#/shared/ui/Breadcrumbs'
import { ProductCard } from '#/widgets/ProductCard'
import { ProductCardSkeleton } from '#/widgets/ProductCard/ui/ProductCardSkeleton'
import { useCityStore } from '#/shared/stores/cityStore'
import { useGetCitiesCitiesGet } from '#/shared/openapi/queries'
import { REFERENCE_LIST_LIMIT } from '#/shared/constants/pagination'
import { getTranslatedName } from '#/shared/utils/getTranslatedName'
import { searchSearchGet } from '#/shared/openapi/requests/sdk.gen'
import { useSearchSearchGetKey } from '#/shared/openapi/queries/common'
import { getDiscountInfo } from '#/shared/utils/discount'

const PAGE_SIZE = 24

const sortMap: Record<
  SortOption,
  NonNullable<NonNullable<SearchSearchGetData['query']>['sort']>
> = {
  most_expensive: 'price_desc',
  most_cheap: 'price_asc',
  recently_added: 'newest',
  with_discounts: 'discounts',
}

interface SearchPageProps {
  query?: string
}

export const SearchPage = ({ query }: SearchPageProps) => {
  const { t, i18n } = useTranslation()
  const loaderRef = useRef<HTMLDivElement>(null)
  const cityId = useCityStore((store) => store.cityId)

  // Город известен только браузеру (localStorage), поэтому на сервере его нет.

  // Если рисовать отметку сразу, серверная разметка не совпадёт с клиентской и

  // React перерисует поддерево целиком (ошибка гидратации). Тот же приём, что

  // и в app/routes/profile/route.tsx: решение принимается после монтирования.

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Поиск больше не прячет товары других городов — их нужно отметить.
  // Список городов уже загружается для выбора города в шапке.
  const { data: cities } = useGetCitiesCitiesGet({ query: { limit: REFERENCE_LIST_LIMIT } })
  const cityNameById = new Map(
    (cities ?? []).map((city) => [city.id, getTranslatedName(city.translations, i18n.language)]),
  )

  const [sort, setSort] = useState<SortOption>()
  const [priceRange, setPriceRange] = useState<PriceRange>({})
  const [selectedBrands, setSelectedBrands] = useState<Array<number>>([])
  const [selectedStores, setSelectedStores] = useState<Array<number>>([])

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: [
      useSearchSearchGetKey,
      'infinite',
      cityId,
      query,
      sort,
      priceRange,
      selectedBrands,
      selectedStores,
    ],
    queryFn: ({ pageParam = 0 }) =>
      searchSearchGet({
        query: {
          city_id: cityId as number,
          q: query || undefined,
          brand_ids: selectedBrands.length > 0 ? selectedBrands : undefined,
          shop_ids: selectedStores.length > 0 ? selectedStores : undefined,
          price_from: priceRange.priceFrom,
          price_to: priceRange.priceTo,
          sort: sort ? sortMap[sort] : undefined,
          skip: pageParam,
          limit: PAGE_SIZE,
        },
      }).then((res) => res.data),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      (lastPage?.products?.length ?? 0) < PAGE_SIZE ? undefined : allPages.length * PAGE_SIZE,
    enabled: cityId !== null,
  })

  const pages = data?.pages ?? []
  const products = pages.flatMap((page) => page?.products ?? [])

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

  const heading = query ? t('search.resultsFor', { query }) : t('search.title')

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: t('breadcrumbs.home'), to: '/' }, { label: heading }]} />
      <div className="flex gap-8">
        <SearchFilterSidebar
          sort={sort}
          onSortChange={setSort}
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
          selectedBrands={selectedBrands}
          onBrandsChange={setSelectedBrands}
          selectedStores={selectedStores}
          onStoresChange={setSelectedStores}
        />
        <div className="flex-1 flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-4 content-start">
            {isLoading && Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            {products.map((product) => {
              const { price, discountPercent, oldPrice } = getDiscountInfo(
                Number(product.price),
                product.discount,
                product.discount_type,
              )
              const name =
                product.translations.find((translation) => translation.language === i18n.language)
                  ?.name ||
                product.translations[0]?.name ||
                ''

              return (
                <ProductCard
                  key={product.id}
                  productId={product.id}
                  images={product.images ?? []}
                  price={price}
                  oldPrice={oldPrice}
                  store=""
                  discount={discountPercent}
                  name={name}
                  deliveryFrom={
                    mounted && product.shop_city_id != null && product.shop_city_id !== cityId
                      ? cityNameById.get(product.shop_city_id)
                      : undefined
                  }
                  currencyCode={product.currency?.code}
                  rating={product.rating_avg}
                  ratingCount={product.rating_count}
                  to={`/${product.id}`}
                  storeTo={`/stores/${product.shop_base_id}`}
                />
              )
            })}
            {isFetchingNextPage &&
              Array.from({ length: 3 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>

          {!isLoading && products.length === 0 && (
            <EmptyState
              variant="plain"
              icon={<SearchX size={44} strokeWidth={1.5} />}
              title={t('search.noResults')}
            />
          )}

          {hasNextPage && <div ref={loaderRef} className="h-10" />}
        </div>
      </div>
    </div>
  )
}
