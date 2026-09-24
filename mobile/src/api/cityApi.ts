import { useQuery } from "@tanstack/react-query";
import api from ".";
import { AxiosError } from "axios";

const useGetAll = () => {
  const query = useQuery<City.Item[], AxiosError<ApiErrorResponse>>({
    queryKey: ["cities"],
    queryFn: async () => {
      const res = await api.req({
        method: "GET",
        url: "/cities/",
      });

      return res.data;
    },
  });

  return query;
};

export const cityApi = {
  useGetAll,
};
