import { useQuery } from "@tanstack/react-query";
import api from ".";
import { AxiosError } from "axios";

const useGet = () => {
  const query = useQuery<DeliveryMessage.Item, AxiosError<ApiErrorResponse>>({
    queryKey: ["get-delivery-message"],
    queryFn: async () => {
      const response = await api.req({
        method: "GET",
        url: "/delivery-message/",
      });

      return response.data;
    },
  });

  return query;
};

export const deliveryMessageApi = {
  useGet,
};
