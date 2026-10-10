declare namespace Cart {
  type Item = {
    shop_base_id: number
    shop_name: string
    shop_logo_path: string
    items: {
      id: number
      product: Product.Item
      quantity: number
      created_at: string
    }[]
  }

  namespace API {
    type GetAllResponse = {
      groups: Item[]
      total_items: number
    }

    type AddBody = { product_id: number; quantity: number }
  }
}
