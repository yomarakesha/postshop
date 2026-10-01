declare namespace Order {
  type StatusCode =
    | "pending"
    | "approved"
    | "rejected"
    | "ready_to_take"
    | "ready_to_deliver"
    | "completed";

  type ShopOrderStatus = "pending" | "approved" | "rejected" | "ready_to_take";
  type UIStatus = "pending" | "in_progress" | "cancelled" | "done";

  /**
   * Как заказ попадёт к покупателю. Сервер выводит его сам (есть пункт
   * выдачи — самовывоз), чтобы подписи «Ждёт в пункте выдачи» / «Передан в
   * доставку» везде совпадали с витриной.
   */
  type DeliveryMethod = "pickup" | "delivery";

  type PaymentType = "cash" | "card" | "cash_and_card";

  type Translation = {
    language: string;
    name: string;
  };

  type Status = {
    id: number;
    code: StatusCode;
    translations: Translation[];
    is_active: boolean;
    created_at: string;
    updated_at: string | null;
  };

  type ItemProduct = {
    id: number;
    product_id: number;
    product: Product.Item;
    quantity: number;
    price_at_order: string;
  };

  type OrderShop = {
    id: number;
    shop_base_id: number;
    shop: ShopBase.Item;
    status: ShopOrderStatus;
    comment: string | null;
    items: ItemProduct[];
    subtotal: string;
    /**
     * Склад, с которого собирается часть заказа. У FBO товар лежит на складе
     * Postshop и часть собирают сотрудники платформы — сменить её статус
     * продавец не может (сервер отвечает 403). null — у старых заказов.
     */
    warehouse_type: ShopBase.WarehouseType | null;
  };

  type Item = {
    id: number;
    user_id: number;
    /** Покупатель приходит вместе с заказом; магазинов в нём нет. */
    user: User.Short;
    order_status: Order.Status;
    payment_type: PaymentType;
    delivery_address: string | null;
    /**
     * Цена доставки; NULL — не назначена или самовывоз. Она уже входит в
     * `effective_total`, поэтому из разницы сумм её нужно вычитать, иначе
     * «скидка» уходит в минус.
     */
    delivery_price: string | null;
    pickup_point: PickupPoint.Item | null;
    /** Может не прийти от старого сервера — тогда подписи нейтральные. */
    delivery_method?: DeliveryMethod;
    comment: string | null;
    items: Order.ItemProduct[];
    shops: (ShopBase.Item & {
      additional: ShopAdditional.Item | null;
    })[];
    order_shops: OrderShop[];
    created_at: string;
    updated_at?: string;
    total: string;
    effective_total: string;
    has_rejected_shops: boolean;
    all_shops_rejected: boolean;
    all_active_shops_ready: boolean;
  };

  namespace API {
    type CreateBody = {
      payment_type: PaymentType;
      delivery_address?: string | null;
      pickup_point_id?: number | null;
      comment?: string | null;
    };

    type GetMyVars = {
      sort: "status_asc" | "status_desc" | "newest" | "oldest";
      limit: number;
      skip?: number;
      status_id?: number;
    };

    type GetMyResponse = Order.Item[];

    type GetTopProductsQuery = {
      limit: number;
    };

    type GetTopProductsResponse = {
      product: Product.Item;
      total_quantity: number;
      total_revenue: string;
    }[];

    type SummaryPeriod = "week" | "month" | "quarter";
    type SummaryTotals = {
      orders_count: number;
      total_revenue: string;
      average_check: string;
      rejected_count: number;
      rejected_share: string;
    };
    type GetSummaryResponse = {
      shop_id: number;
      period: SummaryPeriod;
      period_start: string;
      period_end: string;
      current: SummaryTotals;
      previous: SummaryTotals;
      points: { date: string; orders_count: number; total_revenue: string }[];
    };
    type GetInsightsResponse = {
      shop_id: number;
      period_start: string;
      period_end: string;
      rating_avg: string | null;
      rating_count?: number;
      new_reviews?: number;
      unsold?: {
        product_id: number;
        translations: Product.Translation[];
        price: string;
        views_count: number;
      }[];
      returned?: {
        product_id: number;
        translations: Product.Translation[];
        returns_count: number;
        quantity: string;
      }[];
    };

    type GetShopOrdersResponse = Order.Item[];
    type GetShopOrdersQuery = {
      skip: number;
      limit: number;
      status_id?: number;
      sort: "status_asc" | "status_desc" | "newest" | "oldest";
    };
  }
}
