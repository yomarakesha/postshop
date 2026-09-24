import { DiscountType } from '#/shared/openapi/requests/types.gen'

export interface DiscountInfo {
  price: number
  oldPrice?: number
  discountPercent?: number
}

export const getDiscountInfo = (
  originalPrice: number,
  discount?: number | string | null,
  discountType?: DiscountType | null,
): DiscountInfo => {
  const discountValue = discount ? Number(discount) : undefined
  if (!discountValue) return { price: originalPrice }

  if (discountType === DiscountType.FIXED) {
    const price = originalPrice - discountValue
    const discountPercent =
      originalPrice > 0 ? Math.round((discountValue / originalPrice) * 100) : undefined
    return { price, oldPrice: originalPrice, discountPercent }
  }

  const price = Math.round(originalPrice * (1 - discountValue / 100))
  return { price, oldPrice: originalPrice, discountPercent: discountValue }
}
