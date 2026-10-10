declare namespace Collection {
  type Translation = {
    language: string
    name: string
  }

  type Item = {
    id: number
    translations: Translation[]
    is_active: boolean
    products: Product.Item[]
  }

  namespace API {
    type GetAllVars = {
      skip: number
      limit: number
      products_limit?: number
    }
  }
}
