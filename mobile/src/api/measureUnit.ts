import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import api from ".";
import { AxiosError } from "axios";

const useGetAll = (params: MeasureUnit.API.GetAllVars) => {
  const query = useQuery<
    MeasureUnit.API.GetAllResponse,
    AxiosError<ApiErrorResponse>
  >({
    queryKey: ["measure-unit-get-all"],
    queryFn: async () => {
      const res = await api.req({
        method: "GET",
        url: "/measure-units/",
        params,
      });

      return res.data;
    },
  });

  return query;
};

type GetOneOptions = Omit<
  UseQueryOptions<MeasureUnit.API.GetResponse, AxiosError<ApiErrorResponse>>,
  "queryKey" | "queryFn"
>;

const useGet = (id: number, options: GetOneOptions) => {
  const query = useQuery<
    MeasureUnit.API.GetResponse,
    AxiosError<ApiErrorResponse>
  >({
    queryKey: ["measure-unit-get", id],
    queryFn: async () => {
      const res = await api.req({
        method: "GET",
        url: `/measure-units/${id}`,
      });

      return res.data;
    },
    ...options,
  });

  return query;
};

export const measureUnitApi = {
  useGetAll,
  useGet,
};
