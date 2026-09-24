import { PackageX } from 'lucide-react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { StoreInfoModal } from '../../widgets/StoreCard/ui/StoreInfoModal'
import { ImageGallery } from './ui/ImageGallery'
import { ProductReviews } from './ui/ProductReviews'
import { CounterButton } from './ui/CounterButton'
import type { ModalRef } from '#/shared/ui/Modal'
import { EmptyState } from '#/shared/ui/EmptyState'
import { Breadcrumbs } from '#/shared/ui/Breadcrumbs'
import { REFERENCE_LIST_LIMIT } from '#/shared/constants/pagination'
import { cn } from '#/shared/utils/cn'
import ApprovedIcon from '#/shared/assets/icons/approved.svg?react'
import InfoIcon from '#/shared/assets/icons/info.svg?react'
import { ProductCard } from '#/widgets/ProductCard'
import {
  useGetCategoryCategoriesCategoryIdGet,
  useGetProductProductsProductIdGet,
  useGetProductsAvailabilityStockOperationsAvailabilityGet,
  useGetShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGet,
  useGetShopAdditionalsShopAdditionalsGet,
  useGetSimilarProductsProductsProductIdSimilarGet,
} from '#/shared/openapi/queries'
import { getImageUrl } from '#/shared/utils/getImageUrl'
import { getTranslatedName } from '#/shared/utils/getTranslatedName'
import { getDiscountInfo } from '#/shared/utils/discount'
import { FALLBACK_CURRENCY } from '#/shared/constants/locale'

interface ProductIdPageProps {
  productId: string
  storeId?: string
}

export const ProductIdPage = ({ productId, storeId }: ProductIdPageProps) => {
  const modalRef = useRef<ModalRef>(null)
  const { t, i18n } = useTranslation()
  const numericProductId = Number(productId)

  const { data: product, isLoading: isProductLoading } = useGetProductProductsProductIdGet({
    path: { product_id: numericProductId },
  })

  const shopBaseId = product?.shop_base_id

  const { data: shopAdditional } = useGetShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGet(
    { path: { shop_base_id: shopBaseId! } },
    undefined,
    { enabled: !!shopBaseId },
  )

  const productName = getTranslatedName(product?.translations, i18n.language)

  // Путь над товаром: «Главная › раздел › подраздел › товар». Последнее
  // звено — сам товар, иначе путь обрывается на разделе и непонятно, где
  // стоишь; длинное название обрезается многоточием.
  const { data: category } = useGetCategoryCategoriesCategoryIdGet(
    { path: { category_id: product?.category_id ?? 0 } },
    undefined,
    { enabled: !!product?.category_id },
  )
  const breadcrumbs = [
    { label: t('breadcrumbs.home'), to: '/' },
    ...(category?.parent
      ? [
          {
            label: getTranslatedName(category.parent.translations, i18n.language),
            to: `/categories/${category.parent.id}`,
          },
        ]
      : []),
    ...(category
      ? [
          {
            label: getTranslatedName(category.translations, i18n.language),
            to: `/categories/${category.id}`,
          },
        ]
      : []),
    ...(productName ? [{ label: productName }] : []),
  ]

  const { data: similarProducts } = useGetSimilarProductsProductsProductIdSimilarGet({
    path: { product_id: numericProductId },
  })

  const productDescription =
    product?.translations.find((i) => i.language === i18n.language)?.description ??
    product?.translations[0]?.description ??
    ''
  const {
    price,
    discountPercent: discount,
    oldPrice,
  } = getDiscountInfo(Number(product?.price ?? 0), product?.discount, product?.discount_type)
  const images = (product?.images ?? [])
    .map(getImageUrl)
    .filter((image): image is string => !!image)

  const { data: shopAdditionals } = useGetShopAdditionalsShopAdditionalsGet({
    query: { limit: REFERENCE_LIST_LIMIT },
  })
  const shopNamesMap = new Map<number, string>()
  for (const shop of shopAdditionals ?? []) {
    if (shop.name) shopNamesMap.set(shop.shop_base_id, shop.name)
  }

  const storeName = shopAdditional?.name ?? ''
  const storeLogo = getImageUrl(shopAdditional?.logo_path)
  const storeDescription = shopAdditional?.description ?? ''
  const storePhones = shopAdditional?.phone_numbers ?? []
  const storeAddresses = shopAdditional?.addresses ?? []

  const currencyCode = product?.currency?.code ?? FALLBACK_CURRENCY

  const { data: availabilityData } = useGetProductsAvailabilityStockOperationsAvailabilityGet(
    { query: { product_ids: [numericProductId] } },
    undefined,
    { enabled: Number.isFinite(numericProductId) },
  )
  const availability = availabilityData?.[0]
  // «Нет в наличии» — это не только надпись: класть такой товар в корзину
  // нельзя, иначе отказ приходит в конце оформления.
  const outOfStock = Boolean(availability?.tracked) && Number(availability?.available ?? 0) <= 0
  const filteredRelated = similarProducts?.slice(0, 5)

  if (isProductLoading) {
    return (
      <div className="flex-1 py-6 flex flex-col gap-10">
        <div className="flex flex-col lg:flex-row items-stretch gap-4 lg:gap-8">
          {/* Gallery skeleton */}
          <div className="flex flex-col lg:flex-row flex-1 gap-2 lg:gap-4">
            <div className="h-72 lg:h-120 w-full animate-pulse rounded-base bg-gray-200" />
            <div className="flex flex-row lg:flex-col gap-1 lg:order-first order-last">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="shrink-0 w-14 h-14 lg:w-18.75 lg:h-20 animate-pulse rounded-base bg-gray-200"
                />
              ))}
            </div>
          </div>
          {/* Details skeleton */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="h-20 animate-pulse rounded-base bg-gray-200" />
            <div className="h-16 animate-pulse rounded-base bg-gray-200" />
            <div className="h-20 animate-pulse rounded-base bg-gray-200" />
            <div className="flex-1 animate-pulse rounded-base bg-gray-200" />
          </div>
        </div>
      </div>
    )
  }

  // Загрузка кончилась, а товара нет: он снят с продажи, удалён, либо запрос
  // упал. Без этой ветки страница рисовала пустую оболочку — серый
  // прямоугольник вместо фото, «0.00 TMT», ни названия, ни магазина. Именно так
  // выглядела 500-я на карточке 20 августа: понять по экрану, что сломалось,
  // было нельзя.
  if (!product) {
    return (
      <div className="flex-1">
        <EmptyState
          variant="plain"
          icon={<PackageX size={48} strokeWidth={1.5} />}
          title={t('product.unavailable')}
          hint={t('product.unavailableHint')}
          action={
            <Link to="/" className="p3 font-medium text-blue-main">
              {t('notFound.backHome')}
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex-1 flex min-w-0 flex-col gap-4">
      <Breadcrumbs items={breadcrumbs} />
      <div className="flex flex-col lg:flex-row items-stretch gap-3">
        <ImageGallery images={images} productId={numericProductId} />

        {/* Высота ряда задана галереей (lg:h-120). Та же высота у правой
            колонки: тогда блок описания добирает остаток, и обе колонки
            заканчиваются на одном уровне. */}
        <div className="flex flex-1 flex-col gap-3 lg:h-120">
          <div className="bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 border border-stroke rounded-base">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                {/* Красный — признак скидки. Обычная цена без скидки красной
                    быть не должна: цвет терял смысл. */}
                <span className={cn('p2 font-semibold', discount ? 'text-failure' : 'text-text')}>
                  {price.toFixed(2)} {currencyCode}
                </span>
                {discount && (
                  <span className="rounded-base bg-failure px-1.5 py-0.5 t1 font-semibold text-white">
                    -{discount}%
                  </span>
                )}
              </div>
              {oldPrice && (
                <span className="text-[14px] text-passive2 line-through">
                  {oldPrice.toFixed(2)} {currencyCode}
                </span>
              )}
              {/* В ответе товара не было ни остатка, ни признака наличия:
                  «в наличии N» показать было нечем, и покупатель узнавал о
                  нехватке только отказом при оформлении. Показываем только
                  магазины со складским учётом — у остальных остаток покупку
                  не ограничивает. */}
              {/* Только «в наличии: N». «Нет в наличии» здесь больше не
                  пишем: та же надпись стоит на кнопке, а два одинаковых
                  сообщения рядом читаются как ошибка. */}
              {availability?.tracked && Number(availability.available) > 0 && (
                <span className="t1 text-success font-medium">
                  {t('product.inStock', { count: Number(availability.available) })}
                </span>
              )}
            </div>
            <div className="flex-1 w-full sm:flex-none sm:w-54.5">
              <CounterButton
                productId={numericProductId}
                outOfStock={outOfStock}
                max={availability?.tracked ? Number(availability.available) : undefined}
              />
            </div>
          </div>

          {productName && (
            <div className="bg-white p-3 rounded-base border border-stroke">
              <p className="p2">{productName}</p>
            </div>
          )}

          <div className="bg-white p-3 rounded-base flex gap-4 items-center border border-stroke">
            {/* Знак проверенного магазина стоял у логотипа, будто относится к
                картинке. Перенесён к названию — он говорит о магазине. */}
            <img
              src={storeLogo}
              alt={storeName}
              className="size-12.5 shrink-0 rounded-lg object-cover"
            />
            <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
              {/* Название ведёт на витрину магазина: раньше отсюда можно было
                  открыть только справку, а посмотреть остальные товары
                  продавца было неоткуда. Пока товар не загружен, магазин
                  неизвестен — тогда просто текст, без ссылки в никуда. */}
              {shopBaseId ? (
                <Link
                  to="/stores/$storeId"
                  params={{ storeId: String(shopBaseId) }}
                  className="flex min-w-0 items-center gap-1.5 transition-colors hover:text-blue-main"
                >
                  <h3 className="p1 truncate font-semibold">{storeName}</h3>
                  <span className="shrink-0">
                    <ApprovedIcon />
                  </span>
                </Link>
              ) : (
                <div className="flex min-w-0 items-center gap-1.5">
                  <h3 className="p1 truncate font-semibold">{storeName}</h3>
                  <span className="shrink-0">
                    <ApprovedIcon />
                  </span>
                </div>
              )}
              <button onClick={() => modalRef.current?.open()}>
                <InfoIcon color="#B6BCC7" />
              </button>

              <StoreInfoModal
                ref={modalRef}
                name={storeName}
                logo={storeLogo}
                description={storeDescription}
                phones={storePhones}
                addresses={storeAddresses}
              />
            </div>
          </div>
          {productDescription && (
            /* Блок дотягивается до низа галереи (lg:flex-1), поэтому правая
               колонка заканчивается на одном уровне с фотографией. Раскрытие
               больше не растягивает контейнер и не сдвигает страницу: текст
               прокручивается внутри блока, высота которого не меняется.
               Полоса прокрутки скрыта, как и в остальных списках. */
            <div className="flex flex-col gap-3 rounded-base border border-stroke bg-white p-4 shadow-base lg:min-h-0 lg:flex-1">
              <h3 className="p3 shrink-0 font-medium">{t('product.info')}</h3>
              {/* Длинное описание просто обрезается многоточием по месту:
                  ни кнопки раскрытия, ни прокрутки — раскрытие растягивало
                  блок и сдвигало вниз всё, что под ним. */}
              <p className="p3 line-clamp-4 overflow-hidden lg:line-clamp-6">
                {productDescription}
              </p>
            </div>
          )}
        </div>
      </div>

      <ProductReviews productId={numericProductId} />

      {filteredRelated && filteredRelated.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="p3 font-semibold pl-4">{t('product.similar')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
            {filteredRelated.map((p) => {
              const {
                price: pPrice,
                discountPercent: pDiscount,
                oldPrice: pOldPrice,
              } = getDiscountInfo(Number(p.price), p.discount, p.discount_type)

              return (
                <ProductCard
                  key={p.id}
                  productId={p.id}
                  images={p.images ?? []}
                  price={pPrice}
                  oldPrice={pOldPrice}
                  store={shopNamesMap.get(p.shop_base_id) ?? ''}
                  discount={pDiscount}
                  name={getTranslatedName(p.translations, i18n.language)}
                  currencyCode={p.currency?.code}
                  rating={p.rating_avg}
                  ratingCount={p.rating_count}
                  to={storeId ? `/stores/${storeId}/${p.id}` : `/${p.id}`}
                  storeTo={`/stores/${p.shop_base_id}`}
                  outOfStock={!p.is_active}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
