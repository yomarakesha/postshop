import React, { useCallback, useMemo } from "react";
import Header from "@/components/Header";
import HeaderBottom from "./_components/HeaderBottom";
import ProductsVerticalList from "@/components/ProductsVerticalList";
import useShopStore from "@/store/useShopStore";
import { productsApi } from "@/api/products";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import RefreshControl from "@/ui/RefreshControl";
import ActivityIndicator from "@/ui/ActivityIndicator";
import Typography from "@/ui/Typography";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

const MyProductsScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const currentShopId = useShopStore((s) => s.activeShopBaseId);
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isRefetching,
    refetch,
  } = productsApi.useGetMyInfiniteList({
    limit: 10,
    skip: 0,
    shop_base_id: currentShopId!,
  });

  const products = useMemo(() => {
    return data?.pages.flat() || [];
  }, [data]);

  const handleEndReached = () => {
    if (!isFetchingNextPage && hasNextPage) fetchNextPage();
  };

  const handlePressProduct = (id: number) => {
    router.push({
      pathname: "/(shop-tabs)/(my-products)/[id]",
      params: { id },
    });
  };

  // Раньше у списка не было ни состояния загрузки, ни пустого состояния:
  // при первом открытии и у магазина без товаров экран был просто пустым.
  const renderEmpty = useCallback(() => {
    if (isLoading) return <ActivityIndicator isFullScreen />;

    return (
      <View style={styles.empty}>
        <Typography variant="p2" weight="semiBold" isCentered>
          {t("store.myProducts.empty.title")}
        </Typography>
        <Typography variant="t1" weight="medium" color="secondary" isCentered>
          {t("store.myProducts.empty.description")}
        </Typography>
      </View>
    );
  }, [isLoading, t]);

  return (
    <>
      <Header
        title={t("store.myProducts.headerTitle")}
        titleIsCentered={false}
        headerBottom={<HeaderBottom t={t} />}
        backgroundColor="white"
        style={styles.header}
      />
      <ProductsVerticalList
        withoutFavorite
        data={products}
        withoutBrand
        onPress={handlePressProduct}
        onEndReached={handleEndReached}
        isFetchingNextPage={isFetchingNextPage}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
          />
        }
        t={t}
      />
    </>
  );
};

export default MyProductsScreen;

const styles = StyleSheet.create((theme) => ({
  header: {
    marginBottom: theme.spacing(2),
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing(2),
    paddingHorizontal: theme.spacing(6),
  },
}));
