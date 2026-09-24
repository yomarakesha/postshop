import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import useAppStore from "@/store/useAppStore";

/**
 * Адрес сервиса карт.
 *
 * Раньше адрес сервиса был прибит в коде, из-за чего приложение нельзя было
 * перенаправить на другой сервер: адрес API меняли, а карта продолжала ходить
 * на старый — и после его отключения переставала работать совсем.
 *
 * Хост берём из того же адреса, который человек ввёл на первом экране, а порт
 * у сервиса карт свой — он живёт отдельно от основного API.
 */
const MAP_PORT = 6100;

const getMapStyleBaseUrl = () => {
  const apiUrl = useAppStore.getState().apiUrl;
  if (!apiUrl) return "";
  try {
    const { protocol, hostname } = new URL(apiUrl);
    return `${protocol}//${hostname}:${MAP_PORT}`;
  } catch {
    return "";
  }
};


const useGetStyle = () => {
  const query = useQuery<any, AxiosError<ApiErrorResponse>>({
    queryKey: ["get-map-style"],
    queryFn: async () => {
      // TODO: Valid enpoint in api | env
      const response = await axios.get(
        `${getMapStyleBaseUrl()}/v1/maps/style?key=${process.env.EXPO_PUBLIC_MAP_KEY}`,
      );

      return response.data
    },
  });

  return query;
};

export const mapApi = { useGetStyle };
