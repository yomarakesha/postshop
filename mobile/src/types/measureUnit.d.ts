declare namespace MeasureUnit {
  type Translation = {
    language: AppLang;
    name: string;
  };

  type Item = {
    id: number;
    code: string;
    translations: Translation[];
  };

  namespace API {
    type GetAllVars = {
      limit?: number;
      skip?: number;
    };
    type GetAllResponse = Item[];
    type GetResponse = Item;
  }
}
