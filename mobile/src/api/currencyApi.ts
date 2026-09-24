import { useQuery } from "@tanstack/react-query";
import api from ".";
import { AxiosError } from "axios";

const useGetAll = (params: Currency.API.GetAllVars) => {
  const query = useQuery<
    Currency.API.GetAllResponse,
    AxiosError<ApiErrorResponse>
  >({
    queryKey: ["currency-get-all"],
    queryFn: async () => {
      const res = await api.req({
        method: "GET",
        url: "/currencies/",
        params,
      });

      return res.data;
    },
  });

  return query;
};

export const currencyApi = {
  useGetAll,
};
