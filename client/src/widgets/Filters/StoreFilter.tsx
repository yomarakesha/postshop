import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Checkbox } from '#/shared/ui/Checkbox'
import { SearchInput } from '#/shared/ui/SearchInput'
import { useGetAllShopsFullShopBasesFullGetKey } from '#/shared/openapi/queries/common'
import { getAllShopsFullShopBasesFullGet } from '#/shared/openapi/requests/sdk.gen'
import { RegistrationStatus } from '#/shared/openapi/requests/types.gen'

const PAGE_SIZE = 20

interface StoreFilterProps {
  value: Array<number>
  onChange: (value: Array<number>) => void
}

export const StoreFilter = ({ value, onChange }: StoreFilterProps) => {
  const { t } = useTranslation()
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
    queryKey: [useGetAllShopsFullShopBasesFullGetKey, 'store-filter-infinite', debouncedSearch],
    queryFn: ({ pageParam = 0 }) =>
      getAllShopsFullShopBasesFullGet({
        query: {
          skip: pageParam,
          limit: PAGE_SIZE,
          registration_status: RegistrationStatus.APPROVED,
        },
      }).then((res) => res.data ?? []),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length * PAGE_SIZE,
  })

  const stores = (data?.pages.flat() ?? [])
    .filter((s) => s.is_active && s.additional?.name)
    .filter(
      (s) =>
        !debouncedSearch ||
        s.additional!.name!.toLowerCase().includes(debouncedSearch.toLowerCase()),
    )
  const visible = showAll ? stores : stores.slice(0, 6)

  const toggle = (storeId: number) => {
    onChange(value.includes(storeId) ? value.filter((id) => id !== storeId) : [...value, storeId])
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
      <p className="p3 font-semibold">{t('filter.store')}</p>
      <SearchInput
        placeholder={t('filter.storeSearch')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div ref={listRef} className={showAll ? 'max-h-72 overflow-y-auto no-scrollbar' : ''}>
        <ul className="flex flex-col">
          {visible.map((store) => (
            <li key={store.id}>
              <button
                onClick={() => toggle(store.id)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-2
                           text-left transition-colors hover:bg-gray2"
              >
                {/* Картинки убраны, как и в фильтре брендов: логотипы выводились
                    в широкой рамке без отступов между строками и складывались в
                    вертикальную полосу слипшихся фотографий витрин. */}
                <span className="t1 font-medium">{store.additional?.name}</span>
                <Checkbox checked={value.includes(store.id)} />
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
      {(stores.length > 6 || hasNextPage) && (
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
