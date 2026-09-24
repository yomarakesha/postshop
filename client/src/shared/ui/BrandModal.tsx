import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Check, Search } from 'lucide-react'
import type { ModalRef } from '#/shared/ui/Modal'
import { Modal } from '#/shared/ui/Modal'
import { useGetBrandsBrandsGetKey } from '#/shared/openapi/queries/common'
import { getBrandsBrandsGet } from '#/shared/openapi/requests/sdk.gen'
import { getImageUrl } from '#/shared/utils/getImageUrl'

const PAGE_SIZE = 24

interface BrandModalProps {
  onSelect: (brandId: number, brandName: string) => void
  selectedId?: number
}

export const BrandModal = forwardRef<ModalRef, BrandModalProps>(({ onSelect, selectedId }, ref) => {
  const { t } = useTranslation()
  const modalRef = useRef<ModalRef>(null)
  const loaderRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: [useGetBrandsBrandsGetKey, 'brand-modal-infinite', debouncedSearch],
    queryFn: ({ pageParam = 0 }) =>
      getBrandsBrandsGet({
        query: {
          skip: pageParam,
          limit: PAGE_SIZE,
          name: debouncedSearch || undefined,
        },
      }).then((res) => res.data ?? []),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length * PAGE_SIZE,
  })

  const brands = (data?.pages.flat() ?? []).filter((b) => b.is_active)

  useImperativeHandle(ref, () => ({
    open: () => {
      setSearch('')
      modalRef.current?.open()
    },
    close: () => modalRef.current?.close(),
  }))

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
    const container = listRef.current
    if (!el || !container) return
    const observer = new IntersectionObserver(handleObserver, {
      root: container,
      threshold: 0.1,
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [handleObserver])

  const handleSelect = (brandId: number, brandName: string) => {
    onSelect(brandId, brandName)
    modalRef.current?.close()
  }

  return (
    <Modal ref={modalRef} className="w-full max-w-110 bg-gray2">
      <div className="p-6 flex flex-col gap-4">
        <h2 className="p1 font-bold text-center">{t('addProduct.brandModalTitle')}</h2>

        <div className="flex items-center gap-2.5 rounded-base bg-white border border-stroke px-3.5 py-2.5">
          <Search size={18} className="text-passive1 shrink-0" />
          <input
            placeholder={t('filter.brandSearch')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent p3 outline-none placeholder:text-passive1"
          />
        </div>

        <div ref={listRef} className="flex flex-col gap-1.5 max-h-96 overflow-y-auto no-scrollbar">
          {brands.map((brand) => (
            <button
              key={brand.id}
              type="button"
              onClick={() => handleSelect(brand.id, brand.name)}
              className="flex items-center justify-between w-full px-4 py-3 bg-white rounded-xl hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {brand.image_path && (
                  <img
                    src={getImageUrl(brand.image_path)}
                    alt={brand.name}
                    className="size-8 shrink-0 rounded-lg object-cover"
                  />
                )}
                <span className="p3 font-medium">{brand.name}</span>
              </div>
              {selectedId === brand.id && <Check size={18} className="text-blue-main" />}
            </button>
          ))}
          {isFetchingNextPage && (
            <div className="flex justify-center py-3">
              <div className="size-5 border-2 border-blue-main border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <div ref={loaderRef} className="h-1" />
        </div>
      </div>
    </Modal>
  )
})

BrandModal.displayName = 'BrandModal'
