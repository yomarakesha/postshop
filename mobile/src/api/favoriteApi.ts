import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import api from ".";
import { AxiosError } from "axios";

type GetAllOptions = Omit<
  UseQueryOptions<Favorite.API.getAllResponse, AxiosError<ApiErrorResponse>>,
  "queryKey" | "queryFn"
>;

const FAVORITES_KEY = ["get-all-favorites"] as const;

const useGetAll = (options?: GetAllOptions) => {
  return useQuery<Favorite.API.getAllResponse, AxiosError<ApiErrorResponse>>({
    queryKey: FAVORITES_KEY,
    queryFn: async () => {
      const res = await api.req({
        method: "GET",
        url: "/favorites/",
      });
      return res.data;
    },
    ...options,
  });
};

const useAdd = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Product.Item) => {
      const res = await api.req({
        method: "POST",
        url: `/favorites/${product.id}`,
      });
      return res.data;
    },

    onMutate: async (product) => {
      await queryClient.cancelQueries({ queryKey: FAVORITES_KEY });

      const previous =
        queryClient.getQueryData<Favorite.API.getAllResponse>(FAVORITES_KEY);

      queryClient.setQueryData<Favorite.API.getAllResponse>(
        FAVORITES_KEY,
        (old) => {
          if (!old) return old;
          if (old.some((i) => i.product?.id === product.id)) return old;
          return [...old, { id: Date.now(), product }];
        },
      );

      return { previous };
    },

    onError: (_err, _product, context) => {
      if (context?.previous) {
        queryClient.setQueryData(FAVORITES_KEY, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_KEY });
    },
  });
};

const useRemove = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: number) => {
      const res = await api.req({
        method: "DELETE",
        url: `/favorites/${productId}`,
      });
      return res.data;
    },

    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: FAVORITES_KEY });

      const previous =
        queryClient.getQueryData<Favorite.API.getAllResponse>(FAVORITES_KEY);

      queryClient.setQueryData<Favorite.API.getAllResponse>(
        FAVORITES_KEY,
        (old) => {
          if (!old) return old;
          return old.filter((i) => i.product?.id !== productId);
        },
      );

      return { previous };
    },

    onError: (_err, _productId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(FAVORITES_KEY, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_KEY });
    },
  });
};

export const favoriteApi = {
  useGetAll,
  useAdd,
  useRemove,
};
