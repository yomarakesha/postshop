import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import api from ".";
import { MAX_PAGE_SIZE } from "@/constants/pagination";

/**
 * Возвраты по товарам магазина — глазами продавца. Только чтение: решение
 * по заявке принимает платформа.
 */
const useShopReturns = (shopBaseId: number) =>
  useQuery<ReturnRequest.Item[], AxiosError<ApiErrorResponse>>({
    queryKey: ["shop-returns", shopBaseId],
    queryFn: async () => {
      const res = await api.req({
        method: "GET",
        url: `/returns/shop/${shopBaseId}`,
        params: { limit: MAX_PAGE_SIZE },
      });
      return res.data;
    },
    enabled: !!shopBaseId,
  });

export const returnApi = { useShopReturns };
