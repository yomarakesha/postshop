import { MAX_PAGE_SIZE } from "@/constants/pagination";
import React, { useMemo } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import noOrderImage from "@assets/images/no-order.png";
import Header from "@/components/Header";
import Typography from "@/ui/Typography";
import { useTranslation } from "react-i18next";
import { orderApi } from "@/api/orderApi";
import dayjs from "dayjs";
import { ScrollView } from "react-native-gesture-handler";
import RefreshControl from "@/ui/RefreshControl";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import useShopStore from "@/store/useShopStore";
import Card from "./_components/Card";
import ActivityIndicator from "@/ui/ActivityIndicator";

type OrderMonthGroup = {
  key: string;
  monthKey: number;
  year: number;
  items: Order.Item[];
};

const groupByMonth = (orders: Order.Item[]): OrderMonthGroup[] => {
  const map = new Map<string, OrderMonthGroup>();
  for (const order of orders) {
    const d = dayjs(order.created_at);
    const monthKey = d.month() + 1;
    const year = d.year();
    const key = `${year}-${monthKey}`;
    if (!map.has(key)) {
      map.set(key, { key, monthKey, year, items: [] });
    }
    map.get(key)!.items.push(order);
  }
  return Array.from(map.values());
};

const OrdersScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const shop = useShopStore((s) => s.shop);
  const ordersQuery = orderApi.useGetShopOrders(
    shop?.shop_base_id!,
    {
      sort: "newest",
      skip: 0,
      limit: MAX_PAGE_SIZE,
    },
    !!shop?.id,
  );

  const orders = useMemo(() => {
    return ordersQuery.data ?? [];
  }, [ordersQuery.data]);

  const groupedByMonth = groupByMonth(orders);

  const onRefresh = () => {
    ordersQuery.refetch();
  };

  const handleClickOrder = (id: number) => {
    router.push(`/(shop-tabs)/(orders)/order/${id}`);
  };

  return (
    <>
      <Header title={t("store.orders.headerTitle")} backgroundColor="white" />
      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={ordersQuery.isLoading}
            onRefresh={onRefresh}
          />
        }
      >
        {ordersQuery.isLoading ? (
          <ActivityIndicator isFullScreen />
        ) : groupedByMonth.length > 0 ? (
          groupedByMonth.map((item) => (
            <View key={item.key} style={styles.container}>
              <Typography color="secondary" weight="semiBold">
                {t(`months.${item.monthKey}`)} {item.year}
              </Typography>
              {item.items.map((el) => {
                // find() мог не найти магазин (заказ из другой витрины) —
                // "!" на результате роняло весь экран заказов.
                const orderShop = el.order_shops.find(
                  (s) => s.shop_base_id === shop?.shop_base_id,
                );
                if (!orderShop) return null;

                return (
                  <Card
                    key={String(el.id)}
                    id={el.id}
                    onPress={handleClickOrder}
                    date={dayjs(el.created_at).format("DD.MM.YYYY • HH:mm")}
                    status={
                      el.order_status.code === "rejected"
                        ? "rejected"
                        : (orderShop.status ?? "pending")
                    }
                    price={orderShop.subtotal}
                    t={t}
                  />
                );
              })}
            </View>
          ))
        ) : (
          <View style={styles.center}>
            <Image source={noOrderImage} style={styles.image} />
            <Typography variant="p1" weight="semiBold" isCentered>
              {t("emptyState.orders.title")}
            </Typography>
            <Typography variant="t1" weight="medium" color="secondary" isCentered>
              {t("emptyState.orders.description")}
            </Typography>
          </View>
        )}
      </ScrollView>
    </>
  );
};

export default OrdersScreen;

const styles = StyleSheet.create((theme) => ({
  flex1: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(6),
    gap: theme.spacing(4),
  },
  image: {
    width: 130,
    height: 100,
    marginBottom: theme.spacing(4),
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // раньше отступы задавались инлайновыми marginTop: 24 / 8
    gap: theme.spacing(2),
    paddingHorizontal: theme.spacing(6),
  },
  container: {
    gap: theme.spacing(3),
  },
}));
