declare namespace Stock {
  /**
   * Остаток одного товара.
   *
   * `available` приходит строкой: это десятичное число сервера (товар может
   * продаваться в килограммах), и переводить его в число на клиенте можно
   * только для сравнения, а не для показа.
   */
  type Availability = {
    product_id: number;
    /** false — остаток покупку не ограничивает. */
    tracked: boolean;
    available: string;
  };

  /**
   * Движение по складу, которое заводит продавец. Остальные виды (продажа,
   * возврат от покупателя, пересчёт) пишет сервер сам.
   */
  type ManualOperation = "income" | "return_to_supplier";

  namespace API {
    type Body = {
      shop_id: number;
      product_id: number;
      measure_unit_id: number;
      quantity: number;
    };

    type OperationBody = Body & { operation_type: ManualOperation };
  }
}
