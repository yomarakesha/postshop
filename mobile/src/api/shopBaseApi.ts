import {
  useQueryClient,
  useMutation,
  useQueries,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import api from ".";
import { AxiosError } from "axios";
import { buildMultipartFromBody } from "@/utils/buildMultipartFromBody";

const useCreate = () => {
  const mutation = useMutation<
    ShopBase.API.CreateResponse,
    AxiosError<ApiErrorResponse>,
    ShopBase.API.CreateBody
  >({
    mutationKey: ["create-shop"],
    mutationFn: async (data) => {
      const response = await api.req({
        method: "POST",
        url: "/shop-bases/",
        data,
      });
      return response.data;
    },
  });

  return mutation;
};

const useUploadDocs = (shopId: number) => {
  const mutation = useMutation<
    ShopBase.API.CreateResponse,
    AxiosError<ApiErrorResponse>,
    ShopBase.API.UpdateDocumnentBody
  >({
    mutationKey: ["shop-upload-docs", shopId],
    mutationFn: async (data) => {
      const { body, contentType } = await buildMultipartFromBody(data);
      const response = await api.req({
        method: "POST",
        url: `/shop-bases/${shopId}/documents`,
        data: body,
        headers: { "Content-Type": contentType },
        transformRequest: (d) => d,
      });
      return response.data;
    },
  });
  return mutation;
};

type GetOptions = Omit<
  UseQueryOptions<ShopBase.Item, AxiosError<ApiErrorResponse>>,
  "queryKey" | "queryFn"
>;

const useGet = (shopBaseId: number, options?: GetOptions) => {
  const query = useQuery<ShopBase.Item, AxiosError<ApiErrorResponse>>({
    // С номером магазина: без него при переходе в другой магазин приложение
    // какое-то время видело данные предыдущего — и его «закрыт».
    queryKey: ["shop-base", shopBaseId],
    queryFn: async () => {
      const response = await api.req({
        method: "GET",
        url: `/shop-bases/${shopBaseId}`,
      });
      return response.data;
    },
    ...options,
  });
  return query;
};

type QueryResult = {
  data: (ShopBase.Item | undefined)[];
  isLoading: boolean;
};

const useGetByIds = (shopBaseIds: number[], options: GetOptions) => {
  const query = useQueries({
    queries: shopBaseIds.map((id) => {
      return {
        queryKey: ["shop-base", id],
        queryFn: async () => {
          const response = await api.req({
            method: "GET",
            url: `/shop-bases/${id}`,
          });
          return response.data;
        },
        ...options,
      };
    }),
    combine: (results): QueryResult => {
      return {
        data: results.map((r) => r.data),
        isLoading: results.some((r) => r.isLoading),
      };
    },
  });
  return query;
};

/**
 * Закрыть магазин или открыть его снова. Закрытый магазин пропадает с
 * витрины: покупатели не видят его товары и не могут заказать. Владелец
 * открывает его обратно сам.
 */
const useSetOpen = (shopBaseId: number) => {
  const queryClient = useQueryClient();
  return useMutation<ShopBase.Item, AxiosError<ApiErrorResponse>, boolean>({
    mutationKey: ["shop-base-open", shopBaseId],
    mutationFn: async (open) => {
      const response = await api.req({
        method: "PATCH",
        url: `/shop-bases/${shopBaseId}/${open ? "unblock" : "block"}`,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-base"] });
      // Список «Мои магазины» с пометкой «закрыт» берётся из /auth/me.
      queryClient.invalidateQueries({ queryKey: ["get-me"] });
    },
  });
};

export const shopBaseApi = {
  useCreate,
  useUploadDocs,
  useGet,
  useGetByIds,
  useSetOpen,
};
