declare namespace Withdrawal {
  type Status = "pending" | "completed" | "rejected" | "cancelled";

  /** Заявка продавца FBO на вывоз своего товара со склада Postshop. */
  type Item = {
    id: number;
    shop_id: number;
    shop_name: string | null;
    status: Status;
    comment: string | null;
    /** Причина отказа от склада. */
    resolution_comment: string | null;
    created_at: string | null;
    resolved_at: string | null;
    items: {
      id: number;
      product_id: number;
      product_name: string | null;
      measure_unit_code: string | null;
      quantity: string;
    }[];
  };

  namespace API {
    type CreateBody = {
      shop_id: number;
      items: { product_id: number; quantity: number }[];
      comment?: string | null;
    };
  }
}
