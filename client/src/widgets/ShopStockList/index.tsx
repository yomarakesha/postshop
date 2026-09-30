import { Boxes } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'
import type { StockTarget } from '#/widgets/StockModal'
import { useGetProductsAvailabilityStockOperationsAvailabilityGet } from '#/shared/openapi/queries'
import { useGetMyProductsProductsMyGetKey } from '#/shared/openapi/queries/common'
import { getMyProductsProductsMyGet } from '#/shared/openapi/requests'
import { getTranslatedName } from '#/shared/utils/getTranslatedName'
import { getImageUrl } from '#/shared/utils/getImageUrl'
import { ListSkeleton } from '#/shared/ui/ListSkeleton'
import { Spinner } from '#/shared/ui/Spinner'
import { EmptyState } from '#/shared/ui/EmptyState'
import { cn } from '#/shared/utils/cn'

const PAGE_SIZE = 24

interface Props {
  shopId: number
  /** Кнопка справа у строки; без неё список только показывает остаток. */
  action?: (target: StockTarget) => ReactNode
}

/**
 * Товары магазина с доступным остатком — общий список для «Остатков» и
 * «Приёма товара» (FBS) и для «Склада» (FBO).
 *
 * Остаток берётся из /stock-operations/availability: сервер сам считает его по
 * журналу нужного типа — магазина для FBS, складов платформы для FBO — и
 * вычитает то, что уже держат открытые заказы.
 */
export const ShopStockList = ({ shopId, action }: Props) => {
  const { t, i18n } = useTranslation()
  const loaderRef = useRef<HTMLDivElement>(null)

  const {
    data: pages,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: [useGetMyProductsProductsMyGetKey, String(shopId), 'stock'],
    queryFn: ({ pageParam = 0 }) =>
      getMyProductsProductsMyGet({
        query: { shop_base_id: shopId, skip: pageParam, limit: PAGE_SIZE },
      }).then((res) => res.data ?? []),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length * PAGE_SIZE,
  })

  const products = useMemo(() => pages?.pages.flat() ?? [], [pages])
  const productIds = products.map((product) => product.id)

  const { data: availability } = useGetProductsAvailabilityStockOperationsAvailabilityGet(
    { query: { product_ids: productIds } },
    undefined,
    { enabled: productIds.length > 0 },
  )
  const stockById = new Map((availability ?? []).map((row) => [row.product_id, row]))

  const handleObserver = useCallback(
    (entries: Array<IntersectionObserverEntry>) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage()
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

  if (isLoading) return <ListSkeleton rows={5} />

  if (products.length === 0) {
    return <EmptyState icon={<Boxes size={40} strokeWidth={1.5} />} title={t('products.empty')} />
  }

  return (
    <>
      <ul className="flex flex-col gap-2">
        {products.map((product) => {
          const available = Number(stockById.get(product.id)?.available ?? 0)
          const name = getTranslatedName(product.translations, i18n.language)
          return (
            <li
              key={product.id}
              className="flex items-center gap-3 rounded-base bg-white p-3 shadow-base"
            >
              <img
                src={getImageUrl(product.images?.[0])}
                alt=""
                className="size-12 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="p3 line-clamp-1 font-medium">{name}</p>
                <p
                  className={cn('t1', available > 0 ? 'text-passive2' : 'font-medium text-failure')}
                >
                  {available > 0
                    ? t('stock.available', { count: available })
                    : t('products.outOfStock')}
                </p>
              </div>
              {action?.({
                productId: product.id,
                measureUnitId: product.measure_unit_id,
                name,
                available,
              })}
            </li>
          )
        })}
      </ul>

      {hasNextPage && (
        <div ref={loaderRef} className="flex justify-center py-3">
          {isFetchingNextPage && <Spinner />}
        </div>
      )}
    </>
  )
}
