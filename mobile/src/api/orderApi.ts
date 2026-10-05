import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import api from ".";
import { AxiosError } from "axios";

const useCreate = () => {
  const mutation = useMutation<
    { id: number },
    AxiosError<ApiErrorResponse>,
    Order.API.CreateBody
  >({
    mutationKey: ["create-order"],
    mutationFn: async (data) => {
      const response = await api.req({
        method: "POST",
        url: "/orders/",
        data,
      });
      return response.data;
    },
  });
  return mutation;
};

const useGetAllMy = (params: Order.API.GetMyVars) => {
  const query = useQuery<Order.API.GetMyResponse>({
    queryKey: ["get-all-my-orders", params],
    queryFn: async () => {
      const query = await api.req({
        method: "GET",
        url: "/orders/my",
        params,
      });
      return query.data;
    },
  });

  return query;
};

const useGet = (orderId: number) => {
  const query = useQuery<Order.Item>({
    queryKey: ["get-order", orderId],
    queryFn: async () => {
      const query = await api.req({
        method: "GET",
        url: `/orders/${orderId}`,
      });
      return query.data;
    },
  });
  return query;
};

type GetTopProductsOptions = Omit<
  UseQueryOptions<
    Order.API.GetTopProductsResponse,
    AxiosError<ApiErrorResponse>
  >,
  "queryKey" | "queryFn"
>;

const useGetTopProducts = (
  params: Order.API.GetTopProductsQuery,
  shopId: number,
  options?: GetTopProductsOptions,
) => {
  const query = useQuery<
    Order.API.GetTopProductsResponse,
    AxiosError<ApiErrorResponse>
  >({
    queryKey: ["get-top-products", shopId, params],
    queryFn: async () => {
      const query = await api.req({
        method: "GET",
        url: `/orders/shop/${shopId}/top-products`,
        params,
      });
      return query.data;
    },
    ...options,
  });
  return query;
};

/** Сводка за период и такая же за предыдущий — для сравнения. */
const useGetSummary = (
  shopId: number,
  period: Order.API.SummaryPeriod,
  enabled: boolean = true,
) =>
  useQuery<Order.API.GetSummaryResponse, AxiosError<ApiErrorResponse>>({
    queryKey: ["get-shop-summary", shopId, period],
    queryFn: async () => {
      const response = await api.req({
        method: "GET",
        url: `/orders/shop/${shopId}/summary`,
        params: { period },
      });
      return response.data;
    },
    enabled,
  });

/** Рейтинг, непроданные и возвращаемые товары за месяц. */
const useGetInsights = (shopId: number, enabled: boolean = true) =>
  useQuery<Order.API.GetInsightsResponse, AxiosError<ApiErrorResponse>>({
    queryKey: ["get-shop-insights", shopId],
    queryFn: async () => {
      const response = await api.req({
        method: "GET",
        url: `/orders/shop/${shopId}/insights`,
      });
      return response.data;
    },
    enabled,
  });

const useGetShopOrders = (
  shopId: number,
  params: Order.API.GetShopOrdersQuery,
  enabled: boolean = true,
) => {
  const query = useQuery<Order.API.GetShopOrdersResponse>({
    queryKey: ["get-shop-orders", shopId, params],
    queryFn: async () => {
      const query = await api.req({
        method: "GET",
        url: `/orders/shop/${shopId}`,
        params,
      });
      return query.data;
    },
    enabled,
  });
  return query;
};

const ATTENTION_COUNT_KEY = "shop-orders-attention-count";

/** Как часто сверять счётчик, пока приложение открыто. */
const ATTENTION_REFETCH_MS = 60_000;

/**
 * Сколько заказов ждут действий продавца — для значка на вкладке «Заказы».
 *
 * Продавец не видел, что от него чего-то ждут: новый заказ лежал в общем
 * списке среди завершённых, и узнать о нём можно было только открыв вкладку.
 * Сервер считает части FBS в принятых оператором заказах, которые ещё не
 * приняты или не собраны (FBO собирает склад Postshop — продавцу не задача).
 *
 * Раз в минуту обновляем сами: push-уведомления до приложения доходят не
 * всегда, а заказ ждёт ответа.
 */
const useGetAttentionCount = (shopId: number | undefined | null) =>
  useQuery<{ count: number }, AxiosError<ApiErrorResponse>>({
    queryKey: [ATTENTION_COUNT_KEY, shopId],
    queryFn: async () => {
      const response = await api.req({
        method: "GET",
        url: `/orders/shop/${shopId}/attention-count`,
      });
      return response.data;
    },
    enabled: !!shopId,
    refetchInterval: ATTENTION_REFETCH_MS,
  });

const useUpdateShopStatus = ({
  orderId,
  shopId,
}: {
  orderId: number;
  shopId: number | undefined;
}) => {
  const queryClient = useQueryClient();
  const mutation = useMutation<
    undefined,
    AxiosError<ApiErrorResponse>,
    // comment — причина отказа: уходит покупателю в уведомлении.
    { status_code: Order.ShopOrderStatus; comment?: string | null }
  >({
    mutationKey: ["update-shop-status", orderId, shopId],
    mutationFn: async (data) => {
      if (!shopId) return;
      const query = await api.req({
        method: "PATCH",
        url: `/orders/${orderId}/shop/${shopId}/status`,
        data,
      });
      return query.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-order", orderId],
      });
      queryClient.invalidateQueries({ queryKey: ["get-shop-orders", shopId] });
      // Принятая или собранная часть больше не ждёт продавца — значок на
      // вкладке «Заказы» должен уменьшиться сразу, а не через минуту.
      queryClient.invalidateQueries({
        queryKey: [ATTENTION_COUNT_KEY, shopId],
      });
    },
  });
  return mutation;
};

const useUpdateStatus = (orderId: number) => {
  const queryClient = useQueryClient();
  // reason — причина отмены: уходит магазинам, которые уже могли собирать
  // заказ.
  const mutation = useMutation<
    undefined,
    AxiosError<ApiErrorResponse>,
    string | undefined
  >({
    mutationKey: ["update-status", orderId],
    mutationFn: async (reason) => {
      const query = await api.req({
        method: "POST",
        url: `/orders/${orderId}/cancel`,
        data: { reason: reason ?? null },
      });
      return query.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-order", orderId],
      });
      queryClient.invalidateQueries({ queryKey: ["get-all-my-orders"] });
    },
  });

  return mutation;
};

export const orderApi = {
  useCreate,
  useGetAllMy,
  useGet,
  useGetTopProducts,
  useGetSummary,
  useGetInsights,
  useGetShopOrders,
  useUpdateShopStatus,
  useUpdateStatus,
  useGetAttentionCount,
};
