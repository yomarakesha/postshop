declare namespace Stock {
  /** Одно движение товара — для истории. */
  type Operation = {
    id: number
    operation_type: string
    /** У пересчёта со знаком; у остальных видов — всегда положительное. */
    quantity: string
    created_at: string
    measure_unit: { id: number; code: string }
  }

  /** Остаток FBS в разрезе — для пересчёта полки. */
  type Summary = {
    product_id: number
    balance: string
    /** Что должно лежать на полке: журнал минус собранные, но не проданные заказы. */
    on_shelf: string
    reserved: string
    available: string
  }

  /**
   * Остаток одного товара.
   *
   * `available` приходит строкой: это десятичное число сервера (товар может
   * продаваться в килограммах), и переводить его в число на клиенте можно
   * только для сравнения, а не для показа.
   */
  type Availability = {
    product_id: number
    /** false — остаток покупку не ограничивает. */
    tracked: boolean
    available: string
  }

  /**
   * Движение по складу, которое заводит продавец. Остальные виды (продажа,
   * возврат от покупателя, пересчёт) пишет сервер сам.
   */
  type ManualOperation = 'income' | 'return_to_supplier'

  namespace API {
    type Body = {
      shop_id: number
      product_id: number
      measure_unit_id: number
      quantity: number
    }

    type OperationBody = Body & { operation_type: ManualOperation }
  }
}
