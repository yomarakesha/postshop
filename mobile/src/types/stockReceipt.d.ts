declare namespace StockReceipt {
  type Status = "draft" | "confirmed" | "cancelled";

  type Item = {
    id: number;
    product_id: number;
    product_name: string | null;
    measure_unit: Pick<MeasureUnit.Item, "id" | "code">;
    quantity: string;
  };

  /**
   * Документ приёмки: продавец отправляет товар на склад Postshop, платформа
   * подтверждает приём — после этого товар попадает в остаток.
   */
  type Receipt = {
    id: number;
    shop_id: number;
    warehouse_id: number;
    status: Status;
    created_at: string;
    confirmed_at: string | null;
    items: Item[];
    shop_name: string | null;
    warehouse_name: string | null;
  };

  type Warehouse = {
    id: number;
    name: string;
    address: string | null;
    is_active: boolean;
  };
}
