import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { SearchSection } from './SearchSection'
import SearchIcon from '#/shared/assets/icons/search.svg?react'
import { useSearchSearchGet } from '#/shared/openapi/queries'
import { useCityStore } from '#/shared/stores/cityStore'

interface SearchProps {
  alwaysOpen?: boolean
  onClose?: () => void
}

export const Search = ({ alwaysOpen = false, onClose }: SearchProps) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const cityId = useCityStore((store) => store.cityId)

  const close = () => {
    setIsOpen(false)
    inputRef.current?.blur()
  }

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(timer)
  }, [query])

  const { data, isFetching } = useSearchSearchGet(
    {
      // Пять на все разделы сразу — мало: у однословного запроса выдача
      // легко больше десятка, и нужный товар не попадал в подсказки просто
      // потому, что список коротким обрезан.
      query: { city_id: cityId as number, q: debouncedQuery, limit: 8 },
    },
    undefined,
    { enabled: cityId !== null && debouncedQuery.length > 0 },
  )

  const goToSearch = (q: string) => {
    if (!q.trim()) return
    close()
    navigate({ to: '/search', search: { q: q.trim() } })
  }

  const products = (data?.products ?? []).map((product) => ({
    id: product.id,
    name:
      product.translations.find((translation) => translation.language === i18n.language)?.name ||
      product.translations[0]?.name ||
      '',
  }))

  const brands = (data?.brands ?? []).map((brand) => ({ id: brand.id, name: brand.name }))

  const stores = (data?.shops ?? []).map((shop) => ({
    id: shop.id,
    name: shop.additional?.name ?? '',
  }))

  const hasResults = products.length > 0 || brands.length > 0 || stores.length > 0
  const showPanel = alwaysOpen || (isOpen && (debouncedQuery.length > 0 || hasResults))

  return (
    <div className={`relative flex-1 ${alwaysOpen ? '' : 'max-w-160'}`} ref={containerRef}>
      <div className="flex items-center w-full rounded-lg bg-gray2 border border-stroke">
        <div className="flex items-center gap-2 flex-1 px-4 py-2.5">
          <SearchIcon className="text-passive1 shrink-0" />
          <input
            ref={inputRef}
            placeholder={t('header.searchPlaceholder')}
            className="w-full bg-transparent t1 font-medium outline-none placeholder:text-passive1 text-text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') goToSearch(query)
            }}
            onBlur={(e) => {
              if (!containerRef.current?.contains(e.relatedTarget)) {
                setIsOpen(false)
              }
            }}
          />
          {onClose && (
            <button onClick={onClose} className="text-passive2 shrink-0 ml-1">
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={
              alwaysOpen
                ? 'p-4 flex flex-col gap-5'
                : 'absolute top-full left-0 right-0 bg-white rounded-xl shadow-base z-50 p-4 mt-4 flex flex-col gap-5'
            }
            onMouseDown={(e) => e.preventDefault()}
          >
            {!hasResults && (
              <p className="t1 font-medium text-passive2 text-center py-2">
                {isFetching ? t('header.searching') : t('search.noResults')}
              </p>
            )}
            <SearchSection
              title={t('header.foundProducts')}
              items={products}
              viewAllTo="/search"
              viewAllSearch={{ q: debouncedQuery }}
              getItemTo={(id) => ({ to: `/${id}`, params: {} })}
              onClose={close}
              viewAllLabel={t('header.viewAll')}
            />
            <SearchSection
              title={t('header.foundBrands')}
              items={brands}
              viewAllTo="/brands"
              getItemTo={(id) => ({ to: '/brands/$brandId', params: { brandId: String(id) } })}
              onClose={close}
              viewAllLabel={t('header.viewAll')}
            />
            <SearchSection
              title={t('header.foundStores')}
              items={stores}
              viewAllTo="/stores"
              getItemTo={(id) => ({ to: '/stores/$storeId', params: { storeId: String(id) } })}
              onClose={close}
              viewAllLabel={t('header.viewAll')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
