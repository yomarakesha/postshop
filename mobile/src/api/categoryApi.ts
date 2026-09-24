import { AxiosError } from "axios";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import api from ".";

const useGetAll = (params: Category.API.GetAllVars) => {
  const query = useQuery<Category.Item[], AxiosError<ApiErrorResponse>>({
    queryKey: ["categories", params],
    queryFn: async () => {
      const res = await api.req({
        method: "GET",
        url: "/categories/",
        params,
      });

      return res.data;
    },
  });

  return query;
};

type GetOptions = Omit<
  UseQueryOptions<Category.Item, AxiosError<ApiErrorResponse>>,
  "queryKey" | "queryFn"
>;

const useGet = (categoryId: number, options?: GetOptions) => {
  const query = useQuery<Category.Item, AxiosError<ApiErrorResponse>>({
    queryKey: ["category", categoryId],
    queryFn: async () => {
      const res = await api.req({
        method: "GET",
        url: "/categories/" + categoryId,
      });
      return res.data;
    },
    ...options,
  });

  return query;
};

export const categoryApi = {
  useGetAll,
  useGet,
};
