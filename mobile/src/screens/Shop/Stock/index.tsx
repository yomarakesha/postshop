import Header from "@/components/Header";
import ShopStockList from "@/components/ShopStockList";
import StockSheet, { StockMode, StockTarget } from "@/components/StockSheet";
import useShopStore from "@/store/useShopStore";
import EmptyState from "@/ui/EmptyState";
import Typography from "@/ui/Typography";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";

/** Приход живёт в «Приёме товара»; здесь — сверка полки и возврат поставщику. */
const STOCK_MODES: StockMode[] = ["set", "return_to_supplier"];

/**
 * «Остатки» магазина FBS — как на витрине (`pages/my-store-stock`): сколько
 * каждого товара доступно к продаже и исправление, если на полке иначе.
 *
 * Только FBS: такой магазин хранит товар сам. Остатки магазина FBO — в «Складе».
 */
const ShopStockScreen = () => {
  const { t } = useTranslation();
  const shopId = useShopStore((s) => s.activeShopBaseId);
  const shop = useShopStore((s) => s.shop);
  const sheetRef = useRef<TrueSheet>(null);
  const [target, setTarget] = useState<StockTarget | null>(null);

  const isFbs = shop?.warehouse_type === "fbs";

  return (
    <>
      <Header
        withGoBack
        title={t("store.stock.title")}
        backgroundColor="white"
      />
      {shopId && isFbs ? (
        <>
          <ShopStockList
            shopId={shopId}
            t={t}
            ListHeaderComponent={
              <Typography variant="t1" color="secondary" style={styles.hint}>
                {t("store.stock.subtitle")}
              </Typography>
            }
            action={{
              title: t("store.stock.edit"),
              onPress: (row) => {
                setTarget(row);
                sheetRef.current?.present();
              },
            }}
          />
          <StockSheet
            ref={sheetRef}
            shopId={shopId}
            target={target}
            modes={STOCK_MODES}
            t={t}
          />
        </>
      ) : (
        <EmptyState title={t("store.stock.fbsOnly")} />
      )}
    </>
  );
};

export default ShopStockScreen;

const styles = StyleSheet.create((theme) => ({
  hint: {
    marginBottom: theme.spacing(1),
  },
}));
