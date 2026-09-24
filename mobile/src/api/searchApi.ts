import { AxiosError } from "axios";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import api from ".";

type Options = Omit<
  UseQueryOptions<Search.Response, AxiosError<ApiErrorResponse>>,
  "queryKey" | "queryFn"
>;

/**
 * Поиск по товарам, магазинам, категориям и брендам одним запросом.
 *
 * Экран поиска искал товары через `/products/?name=`, магазины через
 * `/shop-additionals/?name=`, бренды через `/brands/?name=` — три запроса и
 * три простых совпадения по подстроке. Запрос из двух слов такое совпадение
 * не переживает: «nusay ноутбук» не находило ничего, хотя товар называется
 * «Ноутбук Nusay Lite 14» — слова стоят в другом порядке.
 *
 * `/search/` разбирает запрос на слова и требует совпадения каждого, поднимает
 * точные совпадения и товары магазинов своего города. На тех же данных
 * «nusay ноутбук» находит 6 товаров вместо нуля.
 *
 * Ключ запроса один на все вкладки: React Query склеивает их в один сетевой
 * запрос, хотя вызывают его три компонента независимо.
 */
const useSearch = (params: Search.API.Vars, options?: Options) => {
  return useQuery<Search.Response, AxiosError<ApiErrorResponse>>({
    queryKey: ["search", params],
    queryFn: async () => {
      const res = await api.req({
        method: "GET",
        url: "/search/",
        params,
      });
      return res.data;
    },
    ...options,
  });
};

export const searchApi = {
  useSearch,
};
