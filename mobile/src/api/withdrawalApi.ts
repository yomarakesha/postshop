import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import api from ".";

const SHOP_WITHDRAWALS_KEY = "shop-withdrawals";

/** Заявки магазина FBO на вывоз товара со склада Postshop, новые сверху. */
const useShopList = (shopId: number | undefined) =>
  useQuery<Withdrawal.Item[], AxiosError<ApiErrorResponse>>({
    queryKey: [SHOP_WITHDRAWALS_KEY, shopId],
    queryFn: async () => {
      const res = await api.req({
        method: "GET",
        url: `/withdrawals/shop/${shopId}`,
        params: { limit: 100 },
      });
      return res.data;
    },
    enabled: !!shopId,
  });

/**
 * Попросить вернуть товар со склада. Забрать свой товар продавец FBO раньше
 * не мог никак: возврат магазину оформлял только сотрудник.
 */
const useCreate = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Withdrawal.Item,
    AxiosError<ApiErrorResponse>,
    Withdrawal.API.CreateBody
  >({
    mutationFn: async (data) => {
      const res = await api.req({ method: "POST", url: "/withdrawals/", data });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHOP_WITHDRAWALS_KEY] });
    },
  });
};

/** Отозвать заявку, пока склад её не рассмотрел. */
const useCancel = () => {
  const queryClient = useQueryClient();
  return useMutation<Withdrawal.Item, AxiosError<ApiErrorResponse>, number>({
    mutationFn: async (id) => {
      const res = await api.req({
        method: "POST",
        url: `/withdrawals/${id}/cancel`,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHOP_WITHDRAWALS_KEY] });
    },
  });
};

export const withdrawalApi = { useShopList, useCreate, useCancel };
