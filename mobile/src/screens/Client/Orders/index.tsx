import { MAX_PAGE_SIZE } from "@/constants/pagination";
import React, { useMemo } from "react";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import noOrderImage from "@assets/images/no-order.png";
import Header from "@/components/Header";
import Typography from "@/ui/Typography";
import { useTranslation } from "react-i18next";
import { orderApi } from "@/api/orderApi";
import dayjs from "dayjs";
import { ScrollView } from "react-native-gesture-handler";
import Card from "./_components/Card";
import RefreshControl from "@/ui/RefreshControl";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import ActivityIndicator from "@/ui/ActivityIndicator";
import useAppStore from "@/store/useAppStore";
import InernetError from "@/ui/InternetError";
import { orderStatus } from "@/utils/orderStatus";

type OrderMonthGroup = {
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
      map.set(key, { monthKey, year, items: [] });
    }
    map.get(key)!.items.push(order);
  }
  return Array.from(map.values());
};

const OrdersScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  // Цвет шапки берём из темы, а не литералом "white": иначе при тёмной теме
  // шапка осталась бы белой поверх тёмного экрана.
  const { theme } = useUnistyles();
  const hasInternetConnection = useAppStore((s) => s.hasInternetConnection);
  const isServerAvailable = useAppStore((s) => s.isServerAvailable);
  const ordersQuery = orderApi.useGetAllMy({
    limit: MAX_PAGE_SIZE,
    skip: 0,
    sort: "newest",
  });

  const orders = useMemo(() => {
    return ordersQuery.data ?? [];
  }, [ordersQuery.data]);

  const groupedByMonth = groupByMonth(orders);

  const onRefresh = () => {
    ordersQuery.refetch();
  };

  const handleClickOrder = (id: number) => {
    router.push(`/(client-tabs)/(orders)/order/${id}`);
  };

  // Сеть есть, но запрос упал (5xx, таймаут) — раньше экран молча показывал
  // «Заказов нет», и отличить пустой список от ошибки было невозможно.
  if (!hasInternetConnection || !isServerAvailable || ordersQuery.isError) {
    return (
      <InernetError
        t={t}
        onRetry={onRefresh}
        isLoading={ordersQuery.isFetching}
      />
    );
  }

  return (
    <>
      <Header
        backgroundColor={theme.colors.white}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={ordersQuery.isRefetching}
            onRefresh={onRefresh}
          />
        }
      >
        {ordersQuery.isLoading ? (
          <ActivityIndicator isFullScreen />
        ) : groupedByMonth.length > 0 ? (
          groupedByMonth.map((item) => (
            <View
              key={`${item.year}-${item.monthKey}`}
              style={styles.container}
            >
              <Typography color="secondary" weight="semiBold">
                {t(`months.${item.monthKey}`)} {item.year}
              </Typography>
              {item.items.map((el) => (
                <Card
                  key={String(el.id)}
                  id={el.id}
                  onPress={handleClickOrder}
                  date={dayjs(el.created_at).format("DD.MM.YYYY • HH:mm")}
                  status={
                    el.all_shops_rejected
                      ? "cancelled"
                      : orderStatus.client.map[el.order_status.code]
                  }
                  partiallyRejected={
                    el.has_rejected_shops && !el.all_shops_rejected
                  }
                  price={Number(el.effective_total)}
                  currency={
                    el.items.find((item) => item.product.currency)?.product
                      .currency
                  }
                  t={t}
                />
              ))}
            </View>
          ))
        ) : (
          <View style={styles.center}>
            <Image
              source={noOrderImage}
              style={styles.image}
              contentFit="contain"
            />
            <Typography
              variant="p1"
              weight="semiBold"
              isCentered
              style={styles.emptyTitle}
            >
              {t("emptyState.orders.title")}
            </Typography>
            <Typography
              variant="t1"
              weight="medium"
              color="secondary"
              isCentered
            >
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
  scroll: {
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
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // Отступы вместо inline marginTop 24/8 у самих подписей: описание больше
    // не упирается в края экрана на узких телефонах.
    paddingHorizontal: theme.spacing(6),
    gap: theme.spacing(2),
  },
  emptyTitle: {
    marginTop: theme.spacing(4),
  },
  container: {
    gap: theme.spacing(3),
  },
}));
