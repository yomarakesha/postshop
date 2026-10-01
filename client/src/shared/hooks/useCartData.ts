import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueries, useQueryClient } from '@tanstack/react-query'
import { useCartStore } from '#/shared/stores/cartStore'
import { useProfileStore } from '#/shared/stores/profileStore'
import {
  clearCartCartDelete,
  getProductProductsProductIdGet,
  getShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGet,
} from '#/shared/openapi/requests'
import { useGetCartCartGet } from '#/shared/openapi/queries'
import { useGetCartCartGetKey } from '#/shared/openapi/queries/common'
import { getImageUrl } from '#/shared/utils/getImageUrl'
import { getDiscountInfo } from '#/shared/utils/discount'
import { getTranslatedName } from '#/shared/utils/getTranslatedName'
import { FALLBACK_CURRENCY } from '#/shared/constants/locale'
import { useStockAvailability } from '#/shared/hooks/useStockAvailability'

export interface CartProductData {
  id: number
  name: string
  image?: string
  price: number
  oldPrice?: number
  quantity: number
  /** Код валюты товара: в разметке корзины он был голым текстом «TMT». */
  currencyCode: string
  // Товар мог стать недоступным после того, как его положили в корзину:
  // магазин закрылся, товар сняли с продажи или заблокировали категорию.
  // Позицию не убираем — иначе непонятно, куда пропал товар и почему не
  // оформляется заказ, — но в итоги она не входит и заказ не пропустит.
  isAvailable: boolean
  /**
   * Сколько штук можно купить, если магазин ведёт остаток; `undefined` —
   * остаток покупку не ограничивает или ещё не пришёл.
   */
  stockLeft?: number
  /** Остатка нет совсем: позиция недоступна, как и снятый с продажи товар. */
  outOfStock: boolean
  /** Остаток есть, но меньше, чем лежит в корзине. */
  notEnoughStock: boolean
}

export interface CartStoreData {
  id: number
  name: string
  logo?: string
  products: Array<CartProductData>
}

export const useCartData = () => {
  // Название бралось строго на туркменском, язык интерфейса игнорировался, а
  // при отсутствии туркменского перевода в корзине оставалась пустая строка.
  const { i18n } = useTranslation()
  const language = i18n.language
  const profile = useProfileStore((s) => s.profile)
  const isGuest = !profile
  const queryClient = useQueryClient()

  // --- Guest cart (localStorage) ---
  const localItems = useCartStore((s) => s.items)
  const clearLocalCart = useCartStore((s) => s.clearCart)

  const guestProductQueries = useQueries({
    queries: isGuest
      ? localItems.map((item) => ({
          queryKey: ['product', item.product_id],
          queryFn: () =>
            getProductProductsProductIdGet({ path: { product_id: item.product_id } }).then(
              (res) => res.data,
            ),
          staleTime: 5 * 60 * 1000,
        }))
      : [],
  })

  const guestShopBaseIds = useMemo(() => {
    if (!isGuest) return []
    const ids = new Set<number>()
    guestProductQueries.forEach((q) => {
      if (q.data) ids.add(q.data.shop_base_id)
    })
    return Array.from(ids)
  }, [isGuest, guestProductQueries])

  const guestShopQueries = useQueries({
    queries: guestShopBaseIds.map((id) => ({
      queryKey: ['shopAdditional', id],
      queryFn: () =>
        getShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGet({
          path: { shop_base_id: id },
        })
          .then((res) => res.data ?? null)
          // У магазина может не быть профиля — это 404, а не сбой. Клиент
          // теперь бросает, поэтому отсутствие профиля гасим здесь: иначе
          // корзина показывала бы ошибку из-за незаполненного магазина.
          .catch(() => null),
      staleTime: 5 * 60 * 1000,
    })),
  })

  // --- Auth cart (backend API) ---
  const { data: cart, isLoading: isAuthLoading } = useGetCartCartGet({}, undefined, {
    enabled: !isGuest,
  })

  const authShopBaseIds = useMemo(() => {
    if (isGuest || !cart?.groups) return []
    return cart.groups.map((g) => g.shop_base_id)
  }, [isGuest, cart])

  const authShopQueries = useQueries({
    queries: authShopBaseIds.map((id) => ({
      queryKey: ['shopAdditional', id],
      queryFn: () =>
        getShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGet({
          path: { shop_base_id: id },
        })
          .then((res) => res.data ?? null)
          // У магазина может не быть профиля — это 404, а не сбой. Клиент
          // теперь бросает, поэтому отсутствие профиля гасим здесь: иначе
          // корзина показывала бы ошибку из-за незаполненного магазина.
          .catch(() => null),
      staleTime: 5 * 60 * 1000,
    })),
  })

  // --- Build stores ---
  const isLoading = isGuest ? guestProductQueries.some((q) => q.isLoading) : isAuthLoading

  const rawStores = useMemo((): Array<CartStoreData> => {
    if (isGuest) {
      const shopMap = new Map(
        guestShopQueries.filter((q) => q.data).map((q) => [q.data!.shop_base_id, q.data!]),
      )
      const storeMap = new Map<number, CartStoreData>()

      guestProductQueries.forEach((query, index) => {
        const product = query.data
        // Запросы строятся из localItems тем же map, поэтому индексы совпадают.
        const cartItem = localItems[index]

        // Скрытый товар отдаётся как 404: данных нет, но позицию надо показать.
        if (!product) {
          const orphanShopId = -1
          if (!storeMap.has(orphanShopId)) {
            storeMap.set(orphanShopId, {
              id: orphanShopId,
              name: '',
              logo: undefined,
              products: [],
            })
          }
          storeMap.get(orphanShopId)!.products.push({
            id: cartItem.product_id,
            name: '',
            price: 0,
            quantity: cartItem.quantity,
            currencyCode: FALLBACK_CURRENCY,
            isAvailable: false,
            outOfStock: false,
            notEnoughStock: false,
          })
          return
        }
        const shopId = product.shop_base_id
        const { price, oldPrice } = getDiscountInfo(
          Number(product.price),
          product.discount,
          product.discount_type,
        )

        if (!storeMap.has(shopId)) {
          const shop = shopMap.get(shopId)
          storeMap.set(shopId, {
            id: shopId,
            name: shop?.name ?? '',
            logo: getImageUrl(shop?.logo_path),
            products: [],
          })
        }

        storeMap.get(shopId)!.products.push({
          id: product.id,
          name: getTranslatedName(product.translations, language),
          image: getImageUrl(product.images?.[0]),
          price,
          oldPrice,
          quantity: cartItem.quantity,
          currencyCode: product.currency?.code ?? FALLBACK_CURRENCY,
          isAvailable: true,
          outOfStock: false,
          notEnoughStock: false,
        })
      })

      return Array.from(storeMap.values())
    }

    if (!cart?.groups) return []

    const shopMap = new Map(
      authShopQueries.filter((q) => q.data).map((q) => [q.data!.shop_base_id, q.data!]),
    )

    return cart.groups.map((group) => {
      const shop = shopMap.get(group.shop_base_id)
      return {
        id: group.shop_base_id,
        name: shop?.name ?? group.shop_name ?? '',
        logo: getImageUrl(shop?.logo_path),
        products: group.items.map((item) => {
          const { price, oldPrice } = getDiscountInfo(
            Number(item.product.price),
            item.product.discount,
            item.product.discount_type,
          )
          return {
            id: item.product.id,
            name: getTranslatedName(item.product.translations, language),
            image: getImageUrl(item.product.images?.[0]),
            price,
            oldPrice,
            quantity: item.quantity,
            currencyCode: item.product.currency?.code ?? FALLBACK_CURRENCY,
            isAvailable: item.is_available ?? true,
            outOfStock: false,
            notEnoughStock: false,
          }
        }),
      }
    })
  }, [isGuest, guestProductQueries, localItems, guestShopQueries, cart, authShopQueries])

  // --- Остаток ---
  // Корзина раньше про остаток не знала вовсе: товар, который закончился,
  // выглядел обычной позицией, входил в сумму, и отказ приходил только после
  // нажатия «Оформить». Спрашиваем остаток за все позиции одним запросом и
  // помечаем строки прямо здесь, чтобы корзина, боковая корзина и оформление
  // видели одно и то же.
  const cartProductIds = useMemo(
    () => rawStores.flatMap((store) => store.products.map((product) => product.id)),
    [rawStores],
  )
  const availability = useStockAvailability(cartProductIds)

  const stores = useMemo(
    () =>
      rawStores.map((store) => ({
        ...store,
        products: store.products.map((product) => {
          const row = availability.get(product.id)
          if (!product.isAvailable || !row?.tracked) return product
          const stockLeft = Math.max(0, Number(row.available))
          const outOfStock = stockLeft <= 0
          const notEnoughStock = !outOfStock && stockLeft < product.quantity
          return {
            ...product,
            stockLeft,
            outOfStock,
            notEnoughStock,
            // Без остатка позиция в сумму не входит, как и снятый товар.
            isAvailable: !outOfStock,
          }
        }),
      })),
    [rawStores, availability],
  )

  const items = useMemo(() => {
    if (isGuest) return localItems
    if (!cart?.groups) return []
    return cart.groups.flatMap((g) =>
      g.items.map((item) => ({ product_id: item.product.id, quantity: item.quantity })),
    )
  }, [isGuest, localItems, cart])

  // Недоступные позиции в суммы не входят: иначе покупатель видел бы цену,
  // которую заплатить всё равно не сможет.
  const available = stores.map((store) => store.products.filter((p) => p.isAvailable))
  const total = available.reduce(
    (sum, products) => sum + products.reduce((s, p) => s + p.price * p.quantity, 0),
    0,
  )
  const discount = available.reduce(
    (sum, products) =>
      sum +
      products.reduce((s, p) => s + (p.oldPrice ? (p.oldPrice - p.price) * p.quantity : 0), 0),
    0,
  )
  const grandTotal = total - discount
  // Снятый с продажи товар и закончившийся — разные причины, и совет разный:
  // первый только убрать, второй можно дождаться или взять меньше.
  const hasUnavailable = stores.some((store) =>
    store.products.some((p) => !p.isAvailable && !p.outOfStock),
  )
  const hasStockProblem = stores.some((store) =>
    store.products.some((p) => p.outOfStock || p.notEnoughStock),
  )
  const canCheckout = !hasUnavailable && !hasStockProblem

  const clearCart = isGuest
    ? clearLocalCart
    : async () => {
        await clearCartCartDelete()
        queryClient.invalidateQueries({ queryKey: [useGetCartCartGetKey] })
      }

  return {
    items,
    stores,
    total,
    discount,
    grandTotal,
    hasUnavailable,
    hasStockProblem,
    canCheckout,
    isLoading,
    clearCart,
  }
}
