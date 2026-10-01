import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useInfiniteQuery } from '@tanstack/react-query'
import { CategoryFilterSidebar } from './ui/CategoryFilterSidebar'
import type { SortOption } from '../../widgets/Filters/SortFilter'
import type { PriceRange } from '../../widgets/Filters/PriceRangeFilter'
import type { ProductResponse } from '#/shared/openapi/requests'
import { REFERENCE_LIST_LIMIT } from '#/shared/constants/pagination'
import { Breadcrumbs } from '#/shared/ui/Breadcrumbs'
import { ProductCard } from '#/widgets/ProductCard'
import { ProductCardSkeleton } from '#/widgets/ProductCard/ui/ProductCardSkeleton'
import { useOutOfStock } from '#/shared/hooks/useStockAvailability'
import {
  useGetCategoryCategoriesCategoryIdGet,
  useGetProductsProductsGet,
  useGetShopAdditionalsShopAdditionalsGet,
} from '#/shared/openapi/queries'
import { getDiscountInfo } from '#/shared/utils/discount'
import { getProductsProductsGet } from '#/shared/openapi/requests/sdk.gen'
import { useGetProductsProductsGetKey } from '#/shared/openapi/queries/common'
import { getTranslatedName } from '#/shared/utils/getTranslatedName'

interface CategoryIdPageProps {
  categoryId: string
}

const PAGE_SIZE = 24

/** Сколько товаров показываем под списком, когда раздел кончился. */
const SUGGESTIONS_SIZE = 6

export const CategoryIdPage = ({ categoryId }: CategoryIdPageProps) => {
  const { t, i18n } = useTranslation()
  const numericId = Number(categoryId)
  const [sort, setSort] = useState<SortOption>()
  const [priceRange, setPriceRange] = useState<PriceRange>({})
  const [selectedBrands, setSelectedBrands] = useState<Array<number>>([])
  const [selectedStores, setSelectedStores] = useState<Array<number>>([])

  const { data: category } = useGetCategoryCategoriesCategoryIdGet({
    path: { category_id: numericId },
  })

  const categoryName =
    category?.translations.find((translation) => translation.language === i18n.language)?.name ??
    category?.translations[0]?.name ??
    ''

  // Сервер отдаёт 20 товаров по умолчанию, а страница запрашивала их один раз —
  // товары после двадцатого были недоступны. Подгружаем страницами, как на /stores.
  const loaderRef = useRef<HTMLDivElement>(null)

  const {
    data: productPages,
    isLoading: isProductsLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: [
      useGetProductsProductsGetKey,
      numericId,
      selectedBrands,
      selectedStores,
      sort,
      priceRange,
    ],
    queryFn: ({ pageParam = 0 }) =>
      getProductsProductsGet({
        query: {
          category_ids: [numericId],
          brand_ids: selectedBrands.length > 0 ? selectedBrands : undefined,
          shop_base_ids: selectedStores.length > 0 ? selectedStores : undefined,
          sort,
          price_from: priceRange.priceFrom,
          price_to: priceRange.priceTo,
          skip: pageParam,
          limit: PAGE_SIZE,
        },
      }).then((res) => res.data ?? []),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length * PAGE_SIZE,
  })

  const products = productPages?.pages.flat()

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

  // Когда раздел кончился, под списком показываем другие товары каталога:
  // иначе внизу страницы остаётся пустота рядом с корзиной, которая длиннее
  // короткого списка.
  const { data: suggestions } = useGetProductsProductsGet({
    query: { limit: SUGGESTIONS_SIZE * 2, sort: 'recently_added' },
  })

  const { data: shopAdditionals } = useGetShopAdditionalsShopAdditionalsGet({
    query: { limit: REFERENCE_LIST_LIMIT },
  })
  const shopNamesMap = new Map<number, string>()
  for (const shop of shopAdditionals ?? []) {
    if (shop.name) shopNamesMap.set(shop.shop_base_id, shop.name)
  }

  // Раздел, к которому относится подраздел: без него путь обрывался, и
  // вернуться на уровень выше было нельзя.
  const parent = category?.parent
  const breadcrumbs = [
    { label: t('breadcrumbs.home'), to: '/' },
    ...(parent
      ? [
          {
            label: getTranslatedName(parent.translations, i18n.language),
            to: `/categories/${parent.id}`,
          },
        ]
      : []),
    { label: categoryName },
  ]

  // Показываем только то, чего нет в самом разделе.
  const shownIds = new Set((products ?? []).map((product) => product.id))
  const recommended = (suggestions ?? [])
    .filter((product) => !shownIds.has(product.id))
    .slice(0, SUGGESTIONS_SIZE)
  // Одним списком и лента раздела, и подборка под ней: карточки одни и те же.
  const isOutOfStockProduct = useOutOfStock([...(products ?? []), ...recommended])

  const renderCard = (product: ProductResponse, to: string) => {
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
        store={shopNamesMap.get(product.shop_base_id) ?? ''}
        storeTo={`/stores/${product.shop_base_id}`}
        discount={discountPercent}
        name={getTranslatedName(product.translations, i18n.language)}
        outOfStock={isOutOfStockProduct(product)}
        currencyCode={product.currency?.code}
        rating={product.rating_avg}
        ratingCount={product.rating_count}
        to={to}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={breadcrumbs} />
      <div className="flex gap-4">
        <CategoryFilterSidebar
          categoryId={numericId}
          sort={sort}
          onSortChange={setSort}
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
          selectedBrands={selectedBrands}
          onBrandsChange={setSelectedBrands}
          selectedStores={selectedStores}
          onStoresChange={setSelectedStores}
        />
        {/* Подборка живёт в той же колонке, что и список: во всю ширину
            страницы она уезжала под сайдбар фильтров и не совпадала с сеткой
            товаров над собой. */}
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div className="grid grid-cols-3 content-start gap-4">
            {isProductsLoading &&
              Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            {products?.map((product) =>
              renderCard(product, `/categories/${categoryId}/${product.id}`),
            )}
            {isFetchingNextPage &&
              Array.from({ length: 3 }).map((_, i) => <ProductCardSkeleton key={`next-${i}`} />)}
          </div>

          {/* Раздел кончился — показываем другие товары каталога. Иначе внизу
              страницы список обрывается коротким рядом, а рядом с ним остаётся
              пустая полоса под корзиной. */}
          {!hasNextPage && recommended.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="p3 font-semibold">{t('product.youMayLike')}</h2>
              <div className="grid grid-cols-3 gap-4">
                {recommended.map((product) => renderCard(product, `/${product.id}`))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Метка догрузки — только пока есть что грузить. Иначе она добавляла
          внизу страницы пустые 64 px: список и фильтры кончались выше, а
          прилипшая корзина тянулась до самого её низа — та самая «пустота»
          справа в конце страницы. */}
      {hasNextPage && <div ref={loaderRef} className="h-10" />}
    </div>
  )
}
