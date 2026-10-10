import { cartApi } from '@/api/cartApi'
import { productsApi } from '@/api/products'
import { shopAdditionalApi } from '@/api/shopAdditionalApi'
import { useCartStore } from '@/store/useCartStore'
import { useUserStore } from '@/store/useUserStore'
import { useMemo } from 'react'

export type CartData = {
  shopBaseId: number
  shopBaseName: string
  logo_path: string
  products: (Product.Item & { quantity: number; finalPrice: number })[]
  totalItems: number
  shopTotalPrice: number
}

export type CartSummary = {
  groups: CartData[]
  price: number
  discountPrice: number
  total: number
  isLoading: boolean
  isError: boolean
}

const getFinalPrice = (product: Product.Item) => {
  const basePrice = Number(product.price) || 0
  const discount = Number(product.discount) || 0

  if (product.discount_type === 'percentage' && discount > 0) {
    return Math.max(0, basePrice - (basePrice * discount) / 100)
  }
  if (product.discount_type === 'fixed' && discount > 0) {
    return Math.max(0, basePrice - discount)
  }
  return basePrice
}

const useCartData = (): CartSummary => {
  const isGuest = useUserStore((s) => s.isGuest)
  const items = useCartStore((s) => s.items)

  // --- Guest path ---
  const productsIds = useMemo(
    () => (isGuest ? items.map((i) => i.productId) : []),
    [items, isGuest],
  )

  const productsQueries = productsApi.useGetByIds(productsIds, {
    enabled: !!productsIds.length,
  })

  const shopIds = useMemo(() => {
    if (!isGuest || productsQueries.isLoading) return []
    return productsQueries.data.reduce((acc, p) => {
      if (p?.shop_base_id && !acc.includes(p.shop_base_id)) {
        acc.push(p.shop_base_id)
      }
      return acc
    }, [] as number[])
  }, [isGuest, productsQueries.isLoading, productsQueries.data])

  const shopsQueries = shopAdditionalApi.useGetByShopBaseIds(shopIds, {
    enabled: !!shopIds.length,
  })

  // --- Authorized path ---
  const cartQueries = cartApi.useGetAll({
    enabled: !isGuest,
  })

  // --- Map to CartData ---
  const grouped = useMemo<CartData[]>(() => {
    if (!isGuest) {
      if (cartQueries.isLoading) return []

      return (cartQueries.data?.groups ?? []).map((group) => {
        const products = group.items.map((i) => ({
          ...i.product,
          quantity: i.quantity,
          finalPrice: getFinalPrice(i.product),
        }))
        const shopTotalPrice = products.reduce((sum, p) => sum + p.finalPrice * p.quantity, 0)

        return {
          shopBaseId: group.shop_base_id,
          shopBaseName: group.shop_name,
          logo_path: group.shop_logo_path,
          products,
          totalItems: group.items.reduce((sum, i) => sum + i.quantity, 0),
          shopTotalPrice,
        }
      })
    }

    if (productsQueries.isLoading || shopsQueries.isLoading) return []

    return shopsQueries.data.reduce<CartData[]>((acc, shop) => {
      if (!shop) return acc

      const products = productsQueries.data
        .filter((p): p is Product.Item => p?.shop_base_id === shop.shop_base_id)
        .map((p) => ({
          ...p,
          quantity: items.find((i) => i.productId === p.id)?.quantity ?? 0,
          finalPrice: getFinalPrice(p),
        }))

      if (products.length > 0) {
        const shopTotalPrice = products.reduce((sum, p) => sum + p.finalPrice * p.quantity, 0)
        acc.push({
          shopBaseId: shop.shop_base_id,
          shopBaseName: shop.name ?? '',
          logo_path: shop.logo_path!,
          products,
          totalItems: products.reduce((sum, p) => sum + p.quantity, 0),
          shopTotalPrice,
        })
      }

      return acc
    }, [])
  }, [
    isGuest,
    cartQueries.isLoading,
    cartQueries.data,
    productsQueries.isLoading,
    productsQueries.data,
    shopsQueries.isLoading,
    shopsQueries.data,
    items,
  ])

  const totals = useMemo(() => {
    let baseTotal = 0
    let finalTotal = 0

    grouped.forEach((group) => {
      group.products.forEach((product) => {
        const basePrice = Number(product.price) || 0
        const finalPrice = getFinalPrice(product)
        const qty = product.quantity || 0

        baseTotal += basePrice * qty
        finalTotal += finalPrice * qty
      })
    })

    return {
      price: baseTotal,
      discountPrice: baseTotal - finalTotal,
      total: finalTotal,
    }
  }, [grouped])

  const isLoading = isGuest
    ? productsQueries.isLoading || shopsQueries.isLoading
    : cartQueries.isLoading

  const isError = isGuest ? productsQueries.isError || shopsQueries.isError : cartQueries.isError

  return {
    groups: grouped,
    ...totals,
    isLoading,
    isError,
  }
}

export default useCartData
