namespace ShopAdditional {
  type WarehouseType = "fbs" | "fbo";

  type Item = {
    id: number;
    shop_base_id: number;
    warehouse_type: WarehouseType;
    name?: string;
    description?: string;
    addresses?: string[];
    phone_numbers?: string[];
    color?: string;
    color_text?: string;
    logo_path?: string;
    created_at: string;
    updated_at: string;
  };

  namespace API {
    type GetAllVars = {
      limit: number;
      skip: number;
      name?: string;
    };
    type CreateBody = {
      shop_base_id: number;
      city_id?: number;
      name: string;
      warehouse_type: WarehouseType;
      description: string;
      addresses: string[];
      phone_numbers: string[];
      color: string;
      color_text?: string;
      logo: RNFile;
    };

    type UpdateBody = {
      shop_base_id?: number;
      name?: string;
      warehouse_type?: WarehouseType;
      description?: string;
      addresses?: string[];
      phone_numbers?: string[];
      color?: string;
      color_text?: string;
      logo?: RNFile;
    };
  }
}
