import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import api from ".";
import { AxiosError } from "axios";

type GetAllOptions = Omit<
  UseQueryOptions<PickupPoint.API.GetAllResponse, AxiosError<ApiErrorResponse>>,
  "queryKey" | "queryFn"
>;

const useGetAll = (
  params: PickupPoint.API.GetAllVars,
  options?: GetAllOptions,
) => {
  const query = useQuery<
    PickupPoint.API.GetAllResponse,
    AxiosError<ApiErrorResponse>
  >({
    queryKey: ["pickup-points-get-all", params],
    queryFn: async () => {
      const res = await api.req({
        method: "GET",
        url: "/pickup-points/",
        params,
      });

      return res.data;
    },
    ...options,
  });

  return query;
};

const useGet = (pickupPointId: number) => {
  const query = useQuery<
    PickupPoint.API.GetResponse,
    AxiosError<ApiErrorResponse>
  >({
    queryKey: ["pickup-point-get", pickupPointId],
    queryFn: async () => {
      const res = await api.req({
        method: "GET",
        url: `/pickup-points/${pickupPointId}`,
      });

      return res.data;
    },
    enabled: !!pickupPointId
  });

  return query;
};

export const pickupPointsApi = { useGetAll, useGet };
