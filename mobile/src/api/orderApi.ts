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

type GetWeeklyRevenueOptions = Omit<
  UseQueryOptions<
    Order.API.GetWeeklyRevenueResponse,
    AxiosError<ApiErrorResponse>
  >,
  "queryKey" | "queryFn"
>;
const useGetWeeklyRevenue = (
  shopId: number,
  options: GetWeeklyRevenueOptions,
) => {
  const query = useQuery<
    Order.API.GetWeeklyRevenueResponse,
    AxiosError<ApiErrorResponse>
  >({
    queryKey: ["get-weekly-revenue", shopId],
    queryFn: async () => {
      const query = await api.req({
        method: "GET",
        url: `/orders/shop/${shopId}/weekly-revenue`,
      });
      return query.data;
    },
    ...options,
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
    { status_code: Order.ShopOrderStatus }
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
    },
  });
  return mutation;
};

const useUpdateStatus = (orderId: number) => {
  const queryClient = useQueryClient();
  const mutation = useMutation<undefined, AxiosError<ApiErrorResponse>>({
    mutationKey: ["update-status", orderId],
    mutationFn: async () => {
      const query = await api.req({
        method: "POST",
        url: `/orders/${orderId}/cancel`,
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
  useGetWeeklyRevenue,
  useGetTopProducts,
  useGetShopOrders,
  useUpdateShopStatus,
  useUpdateStatus,
};
