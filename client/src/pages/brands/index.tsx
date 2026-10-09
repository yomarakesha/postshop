import { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Breadcrumbs } from '#/shared/ui/Breadcrumbs'
import { StoreCard } from '#/shared/ui/StoreCard'
import { CategoriesSidebar } from '#/widgets/CategoriesSidebar'
import { getBrandsBrandsGet } from '#/shared/openapi/requests/sdk.gen'
import { useGetBrandsBrandsGetKey } from '#/shared/openapi/queries/common'
import { getImageUrl } from '#/shared/utils/getImageUrl'

const PAGE_SIZE = 50

export const BrandsPage = () => {
  const { t } = useTranslation()
  const loaderRef = useRef<HTMLDivElement>(null)

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: [useGetBrandsBrandsGetKey, 'infinite'],
    queryFn: ({ pageParam = 0 }) =>
      getBrandsBrandsGet({
        // Без is_active в каталоге оставались заблокированные бренды:
        // блокировка в админке ни на что не влияла (тот же класс, что C-27).
        // has_products — бренды без товаров вели на пустую страницу.
        query: { skip: pageParam, limit: PAGE_SIZE, is_active: true, has_products: true },
      }).then((res) => res.data ?? []),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length * PAGE_SIZE,
  })

  const brands = data?.pages.flat()

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
    <div className="flex flex-1 flex-col">
      <Breadcrumbs
        items={[{ label: t('breadcrumbs.home'), to: '/' }, { label: t('breadcrumbs.brands') }]}
      />
      <div className="mt-4 lg:mt-8 flex flex-1 gap-4">
        <CategoriesSidebar />
        <div className="flex flex-col w-full gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 content-start gap-4 w-full">
            {isLoading &&
              Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="flex aspect-square animate-pulse rounded-base bg-gray-200"
                />
              ))}
            {brands?.map((brand) => (
              <StoreCard
                key={brand.id}
                name={brand.name}
                image={getImageUrl(brand.image_path)}
                to={`/brands/${brand.id}`}
                showName={false}
              />
            ))}
          </div>
          {hasNextPage && <div ref={loaderRef} className="h-10" />}
        </div>
      </div>
    </div>
  )
}
