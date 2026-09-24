import { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Breadcrumbs } from '#/shared/ui/Breadcrumbs'
import { StoreCard } from '#/shared/ui/StoreCard'
import { CategoriesSidebar } from '#/widgets/CategoriesSidebar'
import { getAllShopsFullShopBasesFullGet } from '#/shared/openapi/requests/sdk.gen'
import { RegistrationStatus } from '#/shared/openapi/requests/types.gen'
import { useGetAllShopsFullShopBasesFullGetKey } from '#/shared/openapi/queries/common'
import { getImageUrl } from '#/shared/utils/getImageUrl'

const PAGE_SIZE = 50

export const StoresPage = () => {
  const { t } = useTranslation()
  const loaderRef = useRef<HTMLDivElement>(null)

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: [useGetAllShopsFullShopBasesFullGetKey, 'infinite'],
    queryFn: ({ pageParam = 0 }) =>
      getAllShopsFullShopBasesFullGet({
        query: {
          skip: pageParam,
          limit: PAGE_SIZE,
          registration_status: RegistrationStatus.APPROVED,
        },
      })
        // Витрина фильтровала только по статусу регистрации и показывала
        // заблокированные магазины: блокировка не убирала их из каталога.
        .then((res) => (res.data ?? []).filter((shop) => shop.is_active)),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length * PAGE_SIZE,
  })

  const shops = data?.pages.flat()

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
        items={[{ label: t('breadcrumbs.home'), to: '/' }, { label: t('breadcrumbs.stores') }]}
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
            {shops?.map((shop) => (
              <StoreCard
                key={shop.id}
                name={shop.additional?.name ?? ''}
                image={getImageUrl(shop.additional?.logo_path)}
                to={`/stores/${shop.id}`}
              />
            ))}
          </div>
          {hasNextPage && <div ref={loaderRef} className="h-10" />}
        </div>
      </div>
    </div>
  )
}
