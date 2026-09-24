declare namespace DeliveryMessage {
  type Translation = {
    language: AppLang;
    text: string;
  };

  type Item = {
    id: number;
    created_at: string;
    updated_at: string | null;
    translations: Translation[];
  };
}
