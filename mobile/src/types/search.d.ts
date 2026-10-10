declare namespace Search {
  /**
   * Магазин в выдаче поиска — это база (`/shop-bases`), а не карточка
   * магазина: название, логотип и цвет лежат во вложенном `additional`.
   * Списочные экраны магазинов работают с плоским `ShopAdditional.Item`,
   * поэтому выдачу поиска приходится разворачивать.
   *
   * `additional` может отсутствовать: магазин заводится в две ступени, и
   * между ними у базы карточки ещё нет.
   */
  type Shop = ShopBase.Item & {
    additional?: ShopAdditional.Item | null
  }

  type Response = {
    products: Product.Item[]
    shops: Shop[]
    categories: Category.Item[]
    brands: Brand.Item[]
  }

  namespace API {
    type Vars = {
      q: string
      /** Город покупателя: товары его магазинов поднимаются в выдаче. */
      city_id?: number | null
      skip?: number
      limit?: number
    }
  }
}
