declare namespace ReturnRequest {
  type Status = "pending" | "approved" | "rejected";

  /** Заявка покупателя на возврат товара; решение принимает платформа. */
  type Item = {
    id: number;
    user_id: number;
    buyer_name: string | null;
    buyer_phone: string | null;
    order_item_id: number;
    order_id: number | null;
    product_id: number | null;
    /** Пусто, если товар с тех пор удалён. */
    product_name: string | null;
    quantity: string;
    reason: string;
    status: Status;
    resolution_comment: string | null;
    /**
     * Кто получает товар назад: FBS — сам продавец (отмечает получение в
     * «Возвратах»), FBO — склад Postshop. null — у старых заказов.
     */
    warehouse_type?: ShopBase.WarehouseType | null;
    /** Когда товар вернулся к тому, кто его хранит; null — ещё в пути. */
    received_at?: string | null;
    /** true — цел и снова в продаже, false — брак; null — не получен. */
    restocked?: boolean | null;
    created_at: string | null;
  };

  namespace API {
    type CreateBody = {
      order_item_id: number;
      quantity: number;
      reason: string;
    };
    type ReceiveBody = { restock: boolean };
  }
}
