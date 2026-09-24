import { PackageOpen } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearch } from '@tanstack/react-router'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { StockModal } from './ui/StockModal'
import type { StockTarget } from './ui/StockModal'
import type { ModalRef } from '#/shared/ui/Modal'
import { useShopAdditional } from '#/shared/hooks/useShopAdditional'
import { EmptyState } from '#/shared/ui/EmptyState'
import {
  useBlockProductProductsProductIdBlockPatch,
  useUnblockProductProductsProductIdUnblockPatch,
} from '#/shared/openapi/queries/queries'
import {
  useGetMyProductsProductsMyGetKey,
  useGetProductsAvailabilityStockOperationsAvailabilityGetKey,
} from '#/shared/openapi/queries/common'
import { WarehouseType, getMyProductsProductsMyGet } from '#/shared/openapi/requests'
import { ProductCard } from '#/widgets/ProductCard'
import { Button } from '#/shared/ui/Button'
import PlusIcon from '#/shared/assets/icons/plus.svg?react'
import { ProductCardSkeleton } from '#/widgets/ProductCard/ui/ProductCardSkeleton'
import { getDiscountInfo } from '#/shared/utils/discount'
import { getTranslatedName } from '#/shared/utils/getTranslatedName'
import { ProductStatus } from '#/shared/openapi/requests/types.gen'
import { Spinner } from '#/shared/ui/Spinner'
import { useGetProductsAvailabilityStockOperationsAvailabilityGet } from '#/shared/openapi/queries'

const PAGE_SIZE = 24

export const ProductsPage = () => {
  const { t, i18n } = useTranslation()
  const { storeId } = useParams({ from: '/my-store/$storeId' })
  const queryClient = useQueryClient()
  const loaderRef = useRef<HTMLDivElement>(null)

  // Лимит выдачи по умолчанию равен 20, и страница запрашивала товары один раз:
  // у продавца с 33 товарами тринадцать не были видны вообще — ни поправить,
  // ни снять с продажи. Подгружаем страницами, как в каталоге.
  const {
    data: pages,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: [useGetMyProductsProductsMyGetKey, storeId],
    queryFn: ({ pageParam = 0 }) =>
      getMyProductsProductsMyGet({
        query: { shop_base_id: Number(storeId), skip: pageParam, limit: PAGE_SIZE },
      }).then((res) => res.data ?? []),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length * PAGE_SIZE,
  })

  const storeProducts = pages?.pages.flat()

  // Остатка не было видно и продавцу: в ответе товара его нет, а поштучный
  // опрос по каждому товару для списка не годится.
  const productIds = storeProducts?.map((p) => p.id) ?? []
  const { data: availability } = useGetProductsAvailabilityStockOperationsAvailabilityGet(
    { query: { product_ids: productIds } },
    undefined,
    { enabled: productIds.length > 0 },
  )
  const stockById = new Map((availability ?? []).map((a) => [a.product_id, a]))

  // Остаток правится здесь же, на карточке. Отдельная страница «Остатки» была
  // вторым списком тех же товаров: в одном товар правят и снимают с продажи, в
  // другом — меняют остаток, и продавец ходил между ними.
  //
  // Только FBS: у магазина FBO товар лежит на складе платформы, приходует его
  // приёмка, и запись в журнал магазина ни на что бы не влияла.
  const { data: additional } = useShopAdditional(Number(storeId))
  const isFbs = additional?.warehouse_type === WarehouseType.FBS
  const stockModalRef = useRef<ModalRef>(null)
  const [stockTarget, setStockTarget] = useState<StockTarget | null>(null)

  const openStock = (target: StockTarget) => {
    setStockTarget(target)
    stockModalRef.current?.open()
  }

  // Права и методы у продавца были, вызовов в интерфейсе не было: снять свой
  // товар с продажи было нечем. Удаления товара в API нет вовсе, поэтому скрыть
  // его — единственный способ убрать с витрины.
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: [useGetMyProductsProductsMyGetKey, storeId] })

  // После движения по складу обновляем именно остатки: список товаров от этого
  // не меняется, а числа на карточках держит их собственная выдача.
  const refreshStock = () =>
    queryClient.invalidateQueries({
      queryKey: [useGetProductsAvailabilityStockOperationsAvailabilityGetKey],
    })
  const hide = useBlockProductProductsProductIdBlockPatch(undefined, { onSuccess: refresh })
  const show = useUnblockProductProductsProductIdUnblockPatch(undefined, { onSuccess: refresh })
  const busy = hide.isPending || show.isPending

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

  // Товар из уведомления: довести до него и один раз подсветить.
  //
  // Список приходит страницами по 24, а нужный товар может лежать на любой из
  // них — поэтому страницы догружаются подряд, пока он не найдётся. Когда он
  // на месте, экран встаёт на него, а подсветка снимается сама: иначе она
  // осталась бы висеть на карточке до ухода со страницы.
  const { product: targetId } = useSearch({ from: '/my-store/$storeId/products/' })
  const targetRef = useRef<HTMLDivElement>(null)
  const [highlighted, setHighlighted] = useState<number>()
  // Один показ на один переход: без этой отметки снятие подсветки запускало бы
  // её заново — карточка мигала бы без конца.
  const shownFor = useRef<number>(undefined)

  useEffect(() => {
    if (!targetId || shownFor.current === targetId) return
    if (!storeProducts?.some((product) => product.id === targetId)) {
      if (hasNextPage && !isFetchingNextPage) void fetchNextPage()
      return
    }
    shownFor.current = targetId
    setHighlighted(targetId)
    targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [targetId, storeProducts, hasNextPage, isFetchingNextPage, fetchNextPage])

  // Снятие подсветки — отдельным действием, со своей зависимостью.
  // В соседнем эффекте таймер не жил: storeProducts — новый массив на каждом
  // рендере, эффект перезапускался и уборка гасила таймер, не дав ему сработать
  // ни разу; подсветка оставалась навсегда.
  useEffect(() => {
    if (!highlighted) return
    const timer = setTimeout(() => setHighlighted(undefined), 2000)
    return () => clearTimeout(timer)
  }, [highlighted])

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Кнопка вынута из потока и закреплена в углу экрана. В шапке списка
          она уезжала вверх вместе с прокруткой, а список бесконечный: чтобы
          добавить товар после просмотра каталога, приходилось возвращаться в
          начало.

          bottom-20 на узких экранах — над нижней панелью навигации (она
          fixed, z-40, скрыта от lg). z-40 тот же: панель и кнопка не
          пересекаются по месту, а модалки (z-50/z-60) накрывают обе. */}
      <Link
        to="/my-store/$storeId/products/add"
        params={{ storeId }}
        className="fixed right-4 bottom-20 z-40 lg:right-6 lg:bottom-6"
      >
        <Button className="fab flex items-center gap-2 rounded-full">
          <PlusIcon width={24} height={24} />
          {t('products.addButton')}
        </Button>
      </Link>

      {isLoading && <ProductsGridSkeleton />}

      {!isLoading && storeProducts && storeProducts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {storeProducts.map((product) => {
            const { price, discountPercent, oldPrice } = getDiscountInfo(
              Number(product.price),
              product.discount,
              product.discount_type,
            )

            const found = stockById.get(product.id)
            const tracked = Boolean(found?.tracked)
            const available = Number(found?.available ?? 0)

            const card = (
              <ProductCard
                productId={product.id}
                images={product.images ?? []}
                price={price}
                oldPrice={oldPrice}
                name={getTranslatedName(product.translations, i18n.language)}
                store=""
                discount={discountPercent}
                hiddenFromSale={!product.is_active}
                inReview={product.status === ProductStatus.PENDING}
                declined={product.status === ProductStatus.DECLINED}
                moderationComment={product.moderation_comment}
                currencyCode={product.currency?.code}
                to={`/my-store/${storeId}/products/edit/${product.id}`}
                // storeTo не передавался, и ссылка магазина под карточкой вела
                // на главную. В своём списке ссылка на магазин не нужна вовсе:
                // store пустой, поэтому она не отрисовывается.
                hideCart
                hideFavorite
                // У FBS остаток написан на самой кнопке, которая его меняет,
                // — строкой он был бы вторым тем же числом рядом.
                stock={tracked && !isFbs ? t('products.stock', { count: available }) : undefined}
                action={
                  <div className="flex flex-col gap-2">
                    {/* Остаток написан на кнопке, которая его и меняет:
                        число и действие над ним — одно место, а не подпись
                        отдельно и кнопка отдельно. */}
                    {tracked && isFbs && (
                      <Button
                        variant="tertiary"
                        size="sm"
                        className="w-full justify-center"
                        onClick={() =>
                          openStock({
                            productId: product.id,
                            measureUnitId: product.measure_unit_id,
                            name: getTranslatedName(product.translations, i18n.language),
                            available,
                          })
                        }
                      >
                        {t('stock.addOperation', { count: available })}
                      </Button>
                    )}
                    <Button
                      variant="tertiary"
                      size="sm"
                      className="w-full justify-center"
                      disabled={busy}
                      onClick={() =>
                        product.is_active
                          ? hide.mutate({ path: { product_id: product.id } })
                          : show.mutate({ path: { product_id: product.id } })
                      }
                    >
                      {product.is_active ? t('products.hide') : t('products.show')}
                    </Button>
                  </div>
                }
              />
            )

            // Обёртка нужна только цели перехода: на ней держатся якорь
            // прокрутки и разовая подсветка, чтобы не трогать саму карточку.
            return product.id === targetId ? (
              <div
                key={product.id}
                ref={targetRef}
                className={highlighted === product.id ? 'highlight-once' : undefined}
              >
                {card}
              </div>
            ) : (
              <div key={product.id}>{card}</div>
            )
          })}
        </div>
      )}

      {/* Метка догрузки — только пока есть что грузить. Иначе под последним
          рядом карточек всегда висела пустая полоса, и колонка со списком
          заканчивалась ниже меню слева. */}
      {hasNextPage && (
        <div ref={loaderRef} className="flex justify-center py-4">
          {isFetchingNextPage && <Spinner />}
        </div>
      )}

      <StockModal
        ref={stockModalRef}
        shopId={Number(storeId)}
        target={stockTarget}
        onDone={refreshStock}
      />

      {!isLoading && (!storeProducts || storeProducts.length === 0) && (
        <EmptyState
          variant="plain"
          icon={<PackageOpen size={44} strokeWidth={1.5} />}
          title={t('products.empty')}
        />
      )}
    </div>
  )
}

const ProductsGridSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
)
