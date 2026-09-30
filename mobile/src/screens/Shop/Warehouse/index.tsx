import Header from "@/components/Header";
import ShopStockList from "@/components/ShopStockList";
import useFeatures from "@/hooks/useFeatures";
import useShopStore from "@/store/useShopStore";
import EmptyState from "@/ui/EmptyState";
import Typography from "@/ui/Typography";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import ShopReceiptsScreen from "../Receipts";

type Tab = "stock" | "shipments";

const TABS: Tab[] = ["stock", "shipments"];

/**
 * «Склад» магазина FBO — как на витрине (`pages/my-store-warehouse`): сколько
 * товара лежит на складе Postshop и документы отправки товара туда.
 *
 * Только FBO и только пока платформа принимает товар на хранение. Магазин
 * FBS хранит товар сам: у него «Остатки» и «Приём товара».
 */
const ShopWarehouseScreen = ({
  initialTab = "stock",
}: {
  initialTab?: Tab;
}) => {
  const { t } = useTranslation();
  const shopId = useShopStore((s) => s.activeShopBaseId);
  const shop = useShopStore((s) => s.shop);
  const { fboEnabled } = useFeatures();
  const [tab, setTab] = useState<Tab>(initialTab);

  const isFbo = shop?.warehouse_type === "fbo";

  const body = () => {
    if (!shopId || !isFbo) {
      return <EmptyState title={t("store.warehouse.fboOnly")} />;
    }
    if (!fboEnabled) {
      return <EmptyState title={t("store.warehouse.disabled")} />;
    }
    return (
      <>
        <View style={styles.tabs}>
          {TABS.map((value) => (
            <Pressable
              key={value}
              onPress={() => setTab(value)}
              style={styles.tab(tab === value)}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === value }}
            >
              <Typography
                variant="t1"
                weight="medium"
                isCentered
                color={tab === value ? "main" : undefined}
              >
                {t(
                  value === "stock"
                    ? "store.warehouse.tabStock"
                    : "store.warehouse.tabShipments",
                )}
              </Typography>
            </Pressable>
          ))}
        </View>
        {tab === "stock" ? (
          <ShopStockList
            shopId={shopId}
            t={t}
            ListHeaderComponent={
              <Typography variant="t1" color="secondary" style={styles.hint}>
                {t("store.warehouse.stockHint")}
              </Typography>
            }
          />
        ) : (
          <ShopReceiptsScreen withHeader={false} />
        )}
      </>
    );
  };

  return (
    <>
      <Header
        withGoBack
        title={t("store.warehouse.title")}
        backgroundColor="white"
      />
      {body()}
    </>
  );
};

export default ShopWarehouseScreen;

const styles = StyleSheet.create((theme) => ({
  tabs: {
    flexDirection: "row",
    gap: theme.spacing(2),
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(3),
  },
  tab: (isActive: boolean) => ({
    flex: 1,
    justifyContent: "center",
    minHeight: theme.spacing(10),
    paddingHorizontal: theme.spacing(2),
    borderRadius: theme.radius.base,
    borderWidth: 1,
    borderColor: isActive ? theme.colors.blueMain : theme.colors.stroke,
    backgroundColor: isActive ? theme.colors.blue1 : theme.colors.white,
  }),
  hint: {
    marginBottom: theme.spacing(1),
  },
}));
