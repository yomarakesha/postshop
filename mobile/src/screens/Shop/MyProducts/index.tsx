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
import ErrorAlert from "@/utils/errorAlert";
import { pickTranslatedName } from "@/utils/pickTranslation";
import useAppStore from "@/store/useAppStore";
import StockSheet, { StockTarget } from "./_components/StockSheet";

/**
 * Подпись кнопки на карточке. Карточка в сетке узкая: обычный размер текста
 * кнопки обрезал «Снять с продажи» до «Снять с прода…». Как на витрине
 * (size="sm") — текст мельче и при нехватке места в две строки.
 */
const CardButtonLabel = ({ children }: { children: string }) => (
  <Typography variant="t1" weight="medium" numberOfLines={2} isCentered>
    {children}
  </Typography>
);

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

  const setForSale = productsApi.useSetForSale();

  // Низ карточки, как на витрине: остаток и «Снять с продажи» / «Вернуть в
  // продажу». Товар при этом не удаляется — покупатель его просто не видит.
  const renderFooter = useCallback(
    (product: Product.Item) => {
      const found = stockById.get(product.id);
      // Остаток не отслеживается (склад платформы выключен) — не показываем.
      const available = found?.tracked ? Number(found.available) : null;
      const isPending =
        setForSale.isPending && setForSale.variables?.productId === product.id;

      return (
        <View style={styles.footer}>
          {available !== null && !isFbs && (
            <Typography variant="t2" color="secondary">
              {t("store.stock.inWarehouse", { count: available })}
            </Typography>
          )}
          {/* Остаток написан на кнопке, которая его и меняет. */}
          {available !== null && isFbs && (
            <Button
              variant="secondary"
              style={styles.footerButton}
              onPress={() => openStock(product, available)}
            >
              <CardButtonLabel>
                {t("store.stock.addOperation", { count: available })}
              </CardButtonLabel>
            </Button>
          )}
          <Button
            variant="secondary"
            style={styles.footerButton}
            disabled={isPending}
            onPress={() =>
              setForSale.mutate(
                { productId: product.id, forSale: !product.is_active },
                { onError: (error) => ErrorAlert(t, error) },
              )
            }
          >
            <CardButtonLabel>
              {t(
                product.is_active
                  ? "store.myProducts.hide"
                  : "store.myProducts.show",
              )}
            </CardButtonLabel>
          </Button>
        </View>
      );
    },
    [stockById, isFbs, openStock, setForSale, t],
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
        renderItemFooter={renderFooter}
        unavailableLabel={t("store.myProducts.hidden")}
        // Список перерисовывается, когда приходит остаток или меняется
        // состояние кнопки снятия с продажи.
        extraData={renderFooter}
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
  footer: {
    marginTop: theme.spacing(2),
    gap: theme.spacing(2),
  },
  footerButton: {
    minHeight: theme.spacing(10),
    paddingVertical: theme.spacing(2),
    paddingHorizontal: theme.spacing(2),
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing(2),
    paddingHorizontal: theme.spacing(6),
  },
}));
