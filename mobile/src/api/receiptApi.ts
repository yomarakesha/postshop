import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import api from ".";
import { MAX_PAGE_SIZE } from "@/constants/pagination";

type Error = AxiosError<ApiErrorResponse>;

/** Документы приёмки магазина — только свои, сервер фильтрует по shop_id. */
const useList = (shopId: number) =>
  useQuery<StockReceipt.Receipt[], Error>({
    queryKey: ["stock-receipts", shopId],
    queryFn: async () => {
      const res = await api.req({
        method: "GET",
        url: "/stock-receipts/",
        params: { shop_id: shopId, limit: MAX_PAGE_SIZE },
      });
      return res.data;
    },
    enabled: !!shopId,
  });

/** Склады платформы, куда можно отправить товар. */
const useWarehouses = (enabled: boolean) =>
  useQuery<StockReceipt.Warehouse[], Error>({
    queryKey: ["warehouses", "active"],
    queryFn: async () => {
      const res = await api.req({
        method: "GET",
        url: "/warehouses/",
        params: { is_active: true, limit: MAX_PAGE_SIZE },
      });
      return res.data;
    },
    enabled,
  });

const useInvalidate = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["stock-receipts"] });
};

const useCreate = () => {
  const invalidate = useInvalidate();
  return useMutation<
    StockReceipt.Receipt,
    Error,
    { shop_id: number; warehouse_id: number }
  >({
    mutationFn: async (body) =>
      (await api.req({ method: "POST", url: "/stock-receipts/", data: body }))
        .data,
    onSuccess: invalidate,
  });
};

const useAddItem = () => {
  const invalidate = useInvalidate();
  return useMutation<
    unknown,
    Error,
    {
      receiptId: number;
      product_id: number;
      measure_unit_id: number;
      quantity: number;
    }
  >({
    mutationFn: async ({ receiptId, ...body }) =>
      (
        await api.req({
          method: "POST",
          url: `/stock-receipts/${receiptId}/items`,
          data: body,
        })
      ).data,
    onSuccess: invalidate,
  });
};

const useDeleteItem = () => {
  const invalidate = useInvalidate();
  return useMutation<unknown, Error, { receiptId: number; itemId: number }>({
    mutationFn: async ({ receiptId, itemId }) =>
      (
        await api.req({
          method: "DELETE",
          url: `/stock-receipts/${receiptId}/items/${itemId}`,
        })
      ).data,
    onSuccess: invalidate,
  });
};

/** Отменить черновик: документ выходит из работы, товар на склад не поступит. */
const useCancel = () => {
  const invalidate = useInvalidate();
  return useMutation<unknown, Error, number>({
    mutationFn: async (receiptId) =>
      (
        await api.req({
          method: "POST",
          url: `/stock-receipts/${receiptId}/cancel`,
        })
      ).data,
    onSuccess: invalidate,
  });
};

export const receiptApi = {
  useList,
  useWarehouses,
  useCreate,
  useAddItem,
  useDeleteItem,
  useCancel,
};
