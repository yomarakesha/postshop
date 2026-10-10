declare namespace Brand {
  type Short = {
    id: number
    name: string
    image_path: string
  }

  type Item = {
    id: number
    name: string
    image_path: string
    is_active: boolean
    created_at: string
    updated_at: string
    /** Только в списке: сколько товаров бренда видит покупатель. */
    products_count?: number | null
  }

  namespace API {
    type GetAllVars = {
      skip: number
      limit: number
      name?: string
      is_active?: boolean
      has_products?: boolean
      with_products_first?: boolean
    }
  }
}
