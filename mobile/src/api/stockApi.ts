import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
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

/** После любого движения остаток на экранах нужно перечитать. */
const useInvalidateAvailability = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["stock-availability"] });
    queryClient.invalidateQueries({ queryKey: ["stock-summary"] });
  };
};

/**
 * Остаток в разрезе для пересчёта: полка, резерв, доступно. Пересчёт
 * сравнивает с полкой — раньше с «доступно», и несобранный заказ, ещё
 * лежащий на полке, прибавлялся второй раз.
 */
const useSummary = (productId: number | undefined, enabled: boolean) =>
  useQuery<Stock.Summary, AxiosError<ApiErrorResponse>>({
    queryKey: ["stock-summary", productId],
    queryFn: async () => {
      const res = await api.req({
        method: "GET",
        url: `/stock-operations/${productId}/summary`,
      });
      return res.data;
    },
    enabled: enabled && !!productId,
  });

/** Приход или возврат поставщику: продавец называет, сколько штук. */
const useCreateOperation = () => {
  const invalidate = useInvalidateAvailability();
  return useMutation<unknown, AxiosError<ApiErrorResponse>, Stock.API.OperationBody>({
    mutationKey: ["stock-operation"],
    mutationFn: async (body) => {
      const res = await api.req({ method: "POST", url: "/stock-operations/", data: body });
      return res.data;
    },
    onSuccess: invalidate,
  });
};

/**
 * Пересчёт: продавец называет, сколько товара на полке сейчас, а разницу
 * записывает сервер. Если остаток не изменился, сервер отвечает 409.
 */
const useSetStock = () => {
  const invalidate = useInvalidateAvailability();
  return useMutation<unknown, AxiosError<ApiErrorResponse>, Stock.API.Body>({
    mutationKey: ["stock-set"],
    mutationFn: async (body) => {
      const res = await api.req({ method: "POST", url: "/stock-operations/set", data: body });
      return res.data;
    },
    onSuccess: invalidate,
  });
};

export const stockApi = {
  useAvailability,
  useSummary,
  useCreateOperation,
  useSetStock,
};
