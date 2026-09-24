import { useUserStore } from "@/store/useUserStore";
import { useCallback, useMemo } from "react";
import { favoriteApi } from "@/api/favoriteApi";
import { useConfirmationModal } from "@/store/useConfirmationModal";
import SignInIcon from "@assets/icons/log-in.svg";
import { TFunction } from "i18next";

export type FavoriteDataTyp = {
  data: Product.Item[];
  toggleFavorite: (product: Product.Item) => void;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
};

const useFavorite = ({
  enabled,
  t,
}: {
  enabled: boolean;
  t: TFunction;
}): FavoriteDataTyp => {
  const isGuest = useUserStore((state) => state.isGuest);

  const favoritesQuery = favoriteApi.useGetAll({
    enabled: enabled || !isGuest,
  });
  const favoriteRemoveMutation = favoriteApi.useRemove();
  const favoriteAddMutation = favoriteApi.useAdd();

  const data = useMemo<Product.Item[]>(() => {
    if (favoritesQuery.isLoading) {
      return [];
    }

    return (favoritesQuery.data ?? [])
      .map((i) => i.product)
      .filter(
        (item): item is Product.Item =>
          item != null && Array.isArray(item.translations),
      );
  }, [favoritesQuery.isLoading, favoritesQuery.data]);

  const handleToggleFavorite = useCallback(
    async (product: Product.Item) => {
      if (isGuest) {
        useConfirmationModal.setState({
          isOpen: true,
          title: t("client.favorites.loginRequired.title"),
          description: t("client.favorites.loginRequired.description"),
          okTitle: t("common.close"),
          type: "info",
          Icon: SignInIcon,
          onConfirm: undefined,
        });
        return;
      }
      if (data.some((i) => i.id === product.id)) {
        await favoriteRemoveMutation.mutateAsync(product.id);
      } else {
        await favoriteAddMutation.mutateAsync(product);
      }
    },
    [isGuest, data, favoriteRemoveMutation, favoriteAddMutation],
  );

  return {
    data,
    toggleFavorite: handleToggleFavorite,
    isLoading: favoritesQuery.isLoading,
    isFetching: favoritesQuery.isFetching,
    refetch: favoritesQuery.refetch,
  };
};

export default useFavorite;
