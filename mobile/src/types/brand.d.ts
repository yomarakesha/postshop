declare namespace Brand {
  type Short = {
    id: number;
    name: string;
    image_path: string;
  };

  type Item = {
    id: number;
    name: string;
    image_path: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };

  namespace API {
    type GetAllVars = {
      skip: number;
      limit: number;
      name?: string;
    };
  }
}
