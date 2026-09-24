declare namespace User {
  type Shop = {
    id: number;
    registration_status: ShopBase.Status;
    name: string | null;
    logo_path: string | null;
    is_active: boolean;
  };
  interface Item {
    id: number;
    phone: string;
    name?: string;
    surname?: string;
    shops: User.Shop[];
  }

  /**
   * Пользователь внутри другого ответа — например покупатель в заказе.
   * Магазинов здесь нет: их отдаёт только `/auth/me`.
   */
  type Short = Omit<Item, "shops">;

  namespace API {
    type LoginBody = {
      phone_number: string;
    };

    type VerifyBody = {
      phone_number: string;
      code: string;
    };

    /**
     * Ответ на подтверждение кода.
     *
     * Магазинов в нём нет — сервер отдаёт их только в `/auth/me`. Раньше тип
     * обещал `shops`, экран входа писал `undefined` в хранилище, и до первого
     * ответа `/auth/me` блок «мои магазины» был пустым.
     */
    type VerifyResponse = Short & {
      access_token: string;
      refresh_token: string;
    };

    type CreateUpdateBody = {
      name: string;
      surname: string;
    };
  }

  namespace Form {
    type CreateUpdate = API.CreateUpdateBody;
  }
}
