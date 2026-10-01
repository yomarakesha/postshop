declare namespace Product {
  type Translation = {
    language: AppLang;
    name: string;
    description: string;
  };

  type Sort =
    "most_expensive" | "most_cheap" | "recently_added" | "with_discounts";

  type DiscountType = "percentage" | "fixed";

  type Status = "pending" | "approved" | "declined";

  interface Item {
    id: number;
    category_id: number;
    shop_base_id: number;
    shop_city_id?: number | null;
    measure_unit_id: number;
    measure_unit: Pick<MeasureUnit.Item, "id" | "translations" | "code">;
    images: string[];
    price: string;
    effective_price: string;
    hashtag?: string;
    brand_id?: number;
    brand: Brand.Short | null;
    translations: Translation[];
    status: Product.Status;
    moderation_comment?: string;
    currency_id?: number;
    currency: Currency.Short | null;
    discount_type?: DiscountType;
    discount?: string;
    rating_avg?: string | null;
    rating_count?: number;
    is_active: boolean;
    /** Штрихкод Postshop (EAN-13): выдаёт сервер, всегда есть, менять нельзя. */
    barcode: string;
    /** Заводской штрихкод производителя (8/12/13/14 цифр) или null. */
    vendor_barcode: string | null;
    created_at: Date;
    updated_at: Date;
  }

  type Filters = {
    shop_base_ids?: number[];
    brand_ids?: number[];
    price_from?: number;
    price_to?: number;
  };

  namespace Form {
    type CreateBody = {
      name: string;
      description: string;
      price: number;
      discount_type?: DiscountType | null;
      // API принимает и число, и строку (anyOf в схеме запроса), а в ответе
      // отдаёт строку. Поэтому значение из ответа можно слать обратно без
      // преобразования — форма редактирования именно так и делает.
      discount?: number | string | null;
      hashtag?: string | null;
      /** Штрихкод производителя; пусто — не указан. */
      vendor_barcode?: string | null;
    };
  }

  namespace API {
    type GetAllVars = Product.Filters & {
      skip: number;
      limit: number;
      name?: string;
      sort?: Sort;
      category_ids?: number[];
    };
    type CreateBody = Omit<Form.CreateBody, "name" | "description"> & {
      translations: Translation[] | string;
      category_id: number;
      shop_base_id: number;
      brand_id: number;
      currency_id?: number;
      measure_unit_id: number;
      images: RNFile[];
    };
    type UpdateBody = {
      translations: Translation[] | string;
      category_id: number;
      shop_base_id: number;
      brand_id: number;
      measure_unit_id: number;
      currency_id?: number;
      images: RNFile[];
      price: number;
      discount_type?: DiscountType | null;
      remove_discount: boolean;
      // API принимает и число, и строку (anyOf в схеме запроса), а в ответе
      // отдаёт строку. Поэтому значение из ответа можно слать обратно без
      // преобразования — форма редактирования именно так и делает.
      discount?: number | string | null;
      hashtag?: string | null;
      // Пустая строка стирает штрихкод на сервере. null/undefined сериализатор
      // multipart выбрасывает, и поле тогда просто не меняется.
      vendor_barcode?: string | null;
    };

    type GetMyVars = Product.Filters & {
      skip: number;
      limit: number;
      shop_base_id?: number;
      status?: Product.Status;
    };
    type GetMyResponse = Product.Item[];
  }
}
