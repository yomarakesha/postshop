import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Checkbox } from '#/shared/ui/Checkbox'
import { SearchInput } from '#/shared/ui/SearchInput'
import { useGetBrandsBrandsGetKey } from '#/shared/openapi/queries/common'
import { useGetBrandsByCategoryAndCityProductsBrandsGet } from '#/shared/openapi/queries/queries'
import { getBrandsBrandsGet } from '#/shared/openapi/requests/sdk.gen'
import { useCityStore } from '#/shared/stores/cityStore'

const PAGE_SIZE = 20

interface BrandFilterProps {
  value: Array<number>
  onChange: (value: Array<number>) => void
  categoryId?: number
}

export const BrandFilter = ({ value, onChange, categoryId }: BrandFilterProps) => {
  const { t } = useTranslation()
  const cityId = useCityStore((s) => s.cityId)
  const loaderRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: [useGetBrandsBrandsGetKey, 'brand-filter-infinite', debouncedSearch],
    queryFn: ({ pageParam = 0 }) =>
      getBrandsBrandsGet({
        query: {
          skip: pageParam,
          limit: PAGE_SIZE,
          name: debouncedSearch || undefined,
          // Раньше неактивные отсеивались уже после ответа, из-за чего
          // постраничная загрузка считала страницы по полной выдаче.
          is_active: true,
          // Бренд без товаров в фильтре даёт только пустой список.
          has_products: true,
        },
      }).then((res) => res.data ?? []),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length * PAGE_SIZE,
    enabled: categoryId === undefined,
  })

  const { data: categoryBrands } = useGetBrandsByCategoryAndCityProductsBrandsGet(
    { query: { category_id: categoryId!, city_id: cityId! } },
    undefined,
    { enabled: categoryId !== undefined && cityId !== null },
  )

  const brands =
    categoryId !== undefined
      ? (categoryBrands ?? []).filter(
          (b) => b.is_active && b.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
        )
      : (data?.pages.flat() ?? []).filter((b) => b.is_active)
  const visible = showAll ? brands : brands.slice(0, 6)

  const toggle = (brandId: number) => {
    onChange(value.includes(brandId) ? value.filter((id) => id !== brandId) : [...value, brandId])
  }

  const handleObserver = useCallback(
    (entries: Array<IntersectionObserverEntry>) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  )

  useEffect(() => {
    if (!showAll) return
    const el = loaderRef.current
    const container = listRef.current
    if (!el || !container) return
    const observer = new IntersectionObserver(handleObserver, {
      root: container,
      threshold: 0.1,
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [handleObserver, showAll])

  return (
    <div className="flex flex-col gap-3">
      <p className="p3 font-semibold">{t('filter.brand')}</p>
      <SearchInput
        placeholder={t('filter.brandSearch')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div ref={listRef} className={showAll ? 'max-h-72 overflow-y-auto no-scrollbar' : ''}>
        <ul className="flex flex-col">
          {visible.map((brand) => (
            <li key={brand.id}>
              <button
                onClick={() => toggle(brand.id)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-2
                           text-left transition-colors hover:bg-gray2"
              >
                <span className="t1 font-medium">{brand.name}</span>
                <Checkbox checked={value.includes(brand.id)} />
              </button>
            </li>
          ))}
        </ul>
        {showAll && isFetchingNextPage && (
          <div className="flex justify-center py-2">
            <div className="size-4 border-2 border-blue-main border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {showAll && <div ref={loaderRef} className="h-1" />}
      </div>
      {(brands.length > 6 || hasNextPage) && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="t1 font-semibold text-blue-main self-start"
        >
          {showAll ? t('filter.showLess') : t('filter.showAll')}
        </button>
      )}
    </div>
  )
}
