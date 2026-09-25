import {
  useInfiniteQuery,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import api from ".";
import { AxiosError } from "axios";
import { buildMultipartFromBody } from "@/utils/buildMultipartFromBody";

type GetAllOptions = Omit<
  UseQueryOptions<Product.Item[], AxiosError<ApiErrorResponse>>,
  "queryKey" | "queryFn"
>;

const useGetAll = (params: Product.API.GetAllVars, options?: GetAllOptions) => {
  const query = useQuery<Product.Item[], AxiosError<ApiErrorResponse>>({
    queryKey: ["get-all-products", params],
    queryFn: async () => {
      const res = await api.req({
        method: "GET",
        url: "/products/",
        params,
      });

      return res.data;
    },
    ...options,
  });

  return query;
};

const useGetInfiniteList = (
  params: Product.API.GetAllVars,
  options?: { enabled: boolean },
) => {
  const limit = params.limit ?? 10;

  const query = useInfiniteQuery({
    initialPageParam: 0,
    queryKey: ["products-infinite-list", params],
    queryFn: async ({ pageParam }) => {
      const res = await api.req({
        method: "GET",
        url: "/products/",
        params: {
          ...params,
          skip: pageParam,
          limit,
        },
      });

      return res.data;
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.length < limit) return undefined;
      return lastPageParam + limit;
    },
    ...options,
  });

  return query;
};

type GetOptions = Omit<
  UseQueryOptions<Product.Item, AxiosError<ApiErrorResponse>>,
  "queryKey" | "queryFn"
>;

const useGet = (productId: number, options?: GetOptions) => {
  const query = useQuery<Product.Item, AxiosError<ApiErrorResponse>>({
    queryKey: ["get-product", productId],
    queryFn: async () => {
      const res = await api.req({
        method: "GET",
        url: `/products/${productId}`,
      });

      return res.data;
    },
    ...options,
  });

  return query;
};

const useCreate = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<undefined, AxiosError, Product.API.CreateBody>({
    mutationKey: ["create-product"],
    mutationFn: async (data) => {
      const { body, contentType } = await buildMultipartFromBody(data);
      const res = await api.req({
        method: "POST",
        url: "/products/",
        headers: { "Content-Type": contentType },
        data: body,
        transformRequest: (d) => d,
      });

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-all-products"] });
      queryClient.invalidateQueries({
        queryKey: ["products-my-infinite-list"],
      });
    },
  });

  return mutation;
};

const useUpdate = (productId: number) => {
  const queryClient = useQueryClient();
  const mutation = useMutation<undefined, AxiosError, Product.API.UpdateBody>({
    mutationKey: ["update-product", productId],
    mutationFn: async (data) => {
      const { body, contentType } = await buildMultipartFromBody(data);
      const res = await api.req({
        method: "PUT",
        url: `/products/${productId}`,
        data: body,
        transformRequest: (d) => d,
        headers: { "Content-Type": contentType },
      });

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-all-products"] });
      queryClient.invalidateQueries({
        queryKey: ["products-my-infinite-list"],
      });
      queryClient.removeQueries({ queryKey: ["get-product", productId] });
    },
  });

  return mutation;
};

type GetByIdsOptions = Omit<
  UseQueryOptions<Product.Item, AxiosError<ApiErrorResponse>>,
  "queryKey" | "queryFn"
>;

type QueryResult = {
  data: (Product.Item | undefined)[];
  isLoading: boolean;
  // Корзина обязана отличать «пусто» от «не загрузилось»: без этого
  // ошибка сети выглядела как пустая корзина.
  isError: boolean;
};

const useGetByIds = (productIds: number[], options?: GetByIdsOptions) => {
  const query = useQueries({
    queries: productIds.map((productId) => ({
      queryKey: ["get-product", productId] as const,
      queryFn: async (): Promise<Product.Item> => {
        const res = await api.req<Product.Item>({
          method: "GET",
          url: `/products/${productId}`,
        });
        return res.data;
      },
      ...options,
    })),
    combine: (results): QueryResult => ({
      data: results.map((r) => r.data),
      isLoading: results.some((r) => r.isLoading),
      isError: results.some((r) => r.isError),
    }),
  });

  return query;
};

const useGetSimilar = (productId: number) => {
  const query = useQuery<Product.Item[], AxiosError<ApiErrorResponse>>({
    queryKey: ["get-similar-products", productId],
    queryFn: async () => {
      const res = await api.req({
        method: "GET",
        url: `/products/${productId}/similar`,
      });

      return res.data;
    },
  });

  return query;
};

const useGetMyInfiniteList = (params: Product.API.GetMyVars) => {
  const limit = params.limit ?? 10;

  const query = useInfiniteQuery({
    initialPageParam: 0,
    queryKey: ["products-my-infinite-list", params],
    queryFn: async ({ pageParam }) => {
      const res = await api.req<Product.API.GetMyResponse>({
        url: "/products/my",
        method: "GET",
        params: {
          ...params,
          skip: pageParam,
          limit,
        },
      });

      return res.data;
    },
    enabled: !!params.shop_base_id,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.length < limit) return undefined;
      return lastPageParam + limit;
    },
  });

  return query;
};

/**
 * Снять товар с продажи или вернуть его в продажу.
 *
 * Товар не удаляется: он остаётся в «Моих товарах», но покупателю не
 * показывается и в корзину не кладётся.
 */
const useSetForSale = () => {
  const queryClient = useQueryClient();
  return useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    { productId: number; forSale: boolean }
  >({
    mutationKey: ["product-for-sale"],
    mutationFn: async ({ productId, forSale }) => {
      const res = await api.req({
        method: "PATCH",
        url: `/products/${productId}/${forSale ? "unblock" : "block"}`,
      });
      return res.data;
    },
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ["get-all-products"] });
      queryClient.invalidateQueries({
        queryKey: ["products-my-infinite-list"],
      });
      queryClient.removeQueries({ queryKey: ["get-product", productId] });
    },
  });
};

export const productsApi = {
  useGetAll,
  useGet,
  useGetInfiniteList,
  useCreate,
  useUpdate,
  useGetByIds,
  useGetSimilar,
  useGetMyInfiniteList,
  useSetForSale,
};
