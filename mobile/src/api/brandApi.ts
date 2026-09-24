import { AxiosError } from "axios";
import {
  useInfiniteQuery,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import api from ".";

const useGetAll = (params: Brand.API.GetAllVars, options?: GetAllOptions) => {
  const query = useQuery<Brand.Item[], AxiosError<ApiErrorResponse>>({
    queryKey: ["brands", params],
    queryFn: async () => {
      const res = await api.req({
        method: "GET",
        url: "/brands/",
        params,
      });

      return res.data;
    },
  });

  return query;
};

type GetAllOptions = Omit<
  UseQueryOptions<Brand.Item[], AxiosError<ApiErrorResponse>>,
  "queryKey" | "queryFn"
>;

const useGetInfiniteList = (
  params: Brand.API.GetAllVars,
  options?: GetAllOptions,
) => {
  const limit = params.limit ?? 10;

  const query = useInfiniteQuery({
    initialPageParam: 0,
    queryKey: ["brands-infinite-list", params],
    queryFn: async ({ pageParam }) => {
      const res = await api.req({
        method: "GET",
        url: "/brands/",
        params: {
          ...params,
          skip: pageParam,
          limit,
        },
        ...options,
      });

      return res.data;
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.length < limit) return undefined;
      return lastPageParam + limit;
    },
  });

  return query;
};

type GetOneOptions = Omit<
  UseQueryOptions<Brand.Item, AxiosError<ApiErrorResponse>>,
  "queryKey" | "queryFn"
>;

const useGet = (id: number, options?: GetOneOptions) => {
  const query = useQuery<Brand.Item, AxiosError<ApiErrorResponse>>({
    queryKey: ["get-brand", id],
    queryFn: async () => {
      const res = await api.req({
        method: "GET",
        url: `/brands/${id}`,
      });

      return res.data;
    },
    ...options,
  });

  return query;
};

export const brandApi = {
  useGetAll,
  useGet,
  useGetInfiniteList,
};
