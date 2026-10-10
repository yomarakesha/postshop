declare namespace Favorite {
  type Item = {
    id: number
    product: Product.Item
  }

  namespace API {
    type getAllResponse = Item[]
  }
}
