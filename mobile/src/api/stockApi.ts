import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import api from ".";

type AvailabilityOptions = Omit<
  UseQueryOptions<Stock.Availability[], AxiosError<ApiErrorResponse>>,
  "queryKey" | "queryFn"
>;

/**
 * Доступный остаток сразу по нескольким товарам.
 *
 * В самом товаре остатка нет: он лежит в журнале склада и зависит от типа
 * склада магазина. Метод публичный — сколько товара на полке, покупатель
 * видит и в обычном магазине. Считается доступный остаток: то, что уже
 * держат открытые заказы, купить нельзя.
 *
 * `tracked: false` означает «остаток покупку не ограничивает» — так отвечают
 * товары магазинов на складе платформы, когда такой учёт выключен.
 */
const useAvailability = (productIds: number[], options?: AvailabilityOptions) => {
  const query = useQuery<Stock.Availability[], AxiosError<ApiErrorResponse>>({
    queryKey: ["stock-availability", productIds],
    queryFn: async () => {
      const res = await api.req({
        method: "GET",
        url: "/stock-operations/availability",
        params: { product_ids: productIds },
      });

      return res.data;
    },
    enabled: productIds.length > 0,
    ...options,
  });

  return query;
};

export const stockApi = {
  useAvailability,
};
