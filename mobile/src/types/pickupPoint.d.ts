declare namespace PickupPoint {
  type Item = {
    id: number;
    city_id: number;
    city: City.Item;
    name: string;
    address: string;
    latitude: string;
    longitude: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  };

  namespace API {
    type GetAllVars = {
      skip: number;
      limit: number;
      city_id?: number;
    };
    type GetAllResponse = Item[];
    type GetResponse = Item;
  }
}
