declare namespace Currency {
  type Translation = {
    language: string;
    name: string;
  };

  type Item = {
    id: number;
    code: string;
    translations: Translation[];
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  };

  type Short = Pick<Item, "id" | "translations" | "code">;

  namespace API {
    type GetAllVars = {
      skip: number;
      limit: number;
    };
    type GetAllResponse = Currency.Item[];
    type GetResponse = Currency.Item;
  }
}
