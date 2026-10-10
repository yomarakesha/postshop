import { create } from 'zustand'

export type ProductFilterType = {
  shops: { name: string; id: number }[] | null
  brands: { name: string; id: number }[] | null
  priceFrom: number | null
  priceTo: number | null
}
type ProductListState = {
  filter: ProductFilterType
  sort: Product.Sort | null
  reset: () => void
}

export const useProductListStore = create<ProductListState>((set) => ({
  filter: {
    shops: null,
    brands: null,
    priceFrom: null,
    priceTo: null,
  },
  sort: null,
  reset: () =>
    set({
      filter: {
        shops: null,
        brands: null,
        priceFrom: null,
        priceTo: null,
      },
      sort: null,
    }),
}))
