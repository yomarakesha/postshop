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
    created_at: string | null;
  };
}
