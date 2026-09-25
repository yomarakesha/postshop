import React, { useCallback, useMemo, useRef, useState } from "react";
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
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { stockApi } from "@/api/stockApi";
import Button from "@/ui/Button";
import { pickTranslatedName } from "@/utils/pickTranslation";
import useAppStore from "@/store/useAppStore";
import StockSheet, { StockTarget } from "./_components/StockSheet";

const MyProductsScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const currentShopId = useShopStore((s) => s.activeShopBaseId);
  const shop = useShopStore((s) => s.shop);
  const currentLanguage = useAppStore((s) => s.lang);
  // Остаток меняет сам продавец только при своём складе (FBS). На складе
  // платформы (FBO) он растёт с приёмкой и падает с заказами — здесь его
  // только показываем.
  const isFbs = shop?.warehouse_type === "fbs";
  const stockSheetRef = useRef<TrueSheet>(null);
  const [stockTarget, setStockTarget] = useState<StockTarget | null>(null);
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

  // Остатка в самом товаре нет — он приходит отдельным запросом, сразу по
  // всем загруженным товарам.
  const productIds = useMemo(() => products.map((p) => p.id), [products]);
  const availabilityQuery = stockApi.useAvailability(productIds);
  const stockById = useMemo(
    () => new Map((availabilityQuery.data ?? []).map((a) => [a.product_id, a])),
    [availabilityQuery.data],
  );

  const openStock = useCallback(
    (product: Product.Item, available: number) => {
      setStockTarget({
        productId: product.id,
        measureUnitId: product.measure_unit_id,
        name: pickTranslatedName(product.translations, currentLanguage),
        available,
      });
      stockSheetRef.current?.present();
    },
    [currentLanguage],
  );

  const renderStock = useCallback(
    (product: Product.Item) => {
      const found = stockById.get(product.id);
      // Не отслеживается (склад платформы выключен) — показывать нечего.
      if (!found?.tracked) return null;
      const available = Number(found.available);
      if (!isFbs) {
        return (
          <Typography variant="t2" color="secondary">
            {t("store.stock.inWarehouse", { count: available })}
          </Typography>
        );
      }
      // Остаток написан на кнопке, которая его и меняет.
      return (
        <Button
          title={t("store.stock.addOperation", { count: available })}
          variant="secondary"
          style={styles.stockButton}
          onPress={() => openStock(product, available)}
        />
      );
    },
    [stockById, isFbs, openStock, t],
  );

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
        renderItemFooter={renderStock}
        // Список перерисовывается, когда приходит остаток.
        extraData={stockById}
        onEndReached={handleEndReached}
        isFetchingNextPage={isFetchingNextPage}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetch();
              availabilityQuery.refetch();
            }}
          />
        }
        t={t}
      />
      {currentShopId && (
        <StockSheet
          ref={stockSheetRef}
          shopId={currentShopId}
          target={stockTarget}
          t={t}
        />
      )}
    </>
  );
};

export default MyProductsScreen;

const styles = StyleSheet.create((theme) => ({
  header: {
    marginBottom: theme.spacing(2),
  },
  stockButton: {
    marginTop: theme.spacing(2),
    minHeight: theme.spacing(9),
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing(2),
    paddingHorizontal: theme.spacing(6),
  },
}));
