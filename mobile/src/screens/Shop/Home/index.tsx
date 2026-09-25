import React, { useMemo } from "react";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Header from "@/components/Header";
import RevenueWidget from "./_components/RevenueWidget";
import BestSellingWidget from "./_components/BestSellingWidget";
import useShopStore from "@/store/useShopStore";
import useAppStore from "@/store/useAppStore";
import { useUserStore } from "@/store/useUserStore";
import HeaderRight from "./_components/HeaderRight";
import { useTranslation } from "react-i18next";
import { orderApi } from "@/api/orderApi";
import { shopBaseApi } from "@/api/shopBaseApi";
import Button from "@/ui/Button";
import Typography from "@/ui/Typography";
import ErrorAlert from "@/utils/errorAlert";
import Toast from "react-native-toast-message";
import RefreshControl from "@/ui/RefreshControl";

const HomeScreen = () => {
  const shop = useShopStore((s) => s.shop);
  const user = useUserStore((s) => s.user);
  const { t } = useTranslation();
  // Статистика — по номеру магазина (shop_base_id), а не по номеру записи с
  // его настройками (shop.id). Их путали: сервер получал номер чужого
  // магазина и отвечал 403 — на экране это выглядело как «нет интернета»,
  // а при совпадении номеров показалась бы статистика другого магазина.
  const shopBaseId = shop?.shop_base_id;
  const shopBaseQuery = shopBaseApi.useGet(shopBaseId!, {
    enabled: !!shopBaseId,
  });
  const setOpen = shopBaseApi.useSetOpen(shopBaseId!);
  const isClosed = shopBaseQuery.data?.is_active === false;

  const reopen = () =>
    setOpen.mutate(true, {
      onSuccess: () =>
        Toast.show({ type: "success", text1: t("store.close.reopened") }),
      onError: (error) => ErrorAlert(t, error),
    });
  const weeklyRevenueQuery = orderApi.useGetWeeklyRevenue(shopBaseId!, {
    enabled: !!shopBaseId,
  });
  const topProductsQuery = orderApi.useGetTopProducts(
    {
      limit: 5,
    },
    shopBaseId!,
    { enabled: !!shopBaseId },
  );

  const handlePressProfile = () => {
    useAppStore.setState({
      mode: "client",
    });
    useShopStore.setState({ shop: null });
  };

  const topProducts = useMemo(() => {
    return topProductsQuery.data ?? [];
  }, [topProductsQuery.data]);

  const handleRefresh = () => {
    weeklyRevenueQuery.refetch();
    topProductsQuery.refetch();
  };

  return (
    <>
      <Header
        title={t("store.home.headerTitle")}
        titleIsCentered={false}
        backgroundColor={shop?.color}
        headerRight={
          user ? (
            <HeaderRight user={user} onPressProfile={handlePressProfile} />
          ) : undefined
        }
      />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={
              weeklyRevenueQuery.isFetching || topProductsQuery.isFetching
            }
            onRefresh={handleRefresh}
          />
        }
      >
        {isClosed && (
          <View style={styles.closed}>
            <Typography variant="p3" weight="medium">
              {t("store.close.reopenSubtitle")}
            </Typography>
            <Button
              title={t("store.close.reopen")}
              variant="primary"
              disabled={setOpen.isPending}
              onPress={reopen}
            />
          </View>
        )}
        <RevenueWidget
          amount={weeklyRevenueQuery.data?.total_revenue}
          ordersCount={weeklyRevenueQuery.data?.orders_count}
          isLoading={weeklyRevenueQuery.isLoading}
          t={t}
        />
        <BestSellingWidget
          data={topProducts}
          isLoading={topProductsQuery.isLoading}
          t={t}
        />
      </ScrollView>
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create((theme) => ({
  closed: {
    gap: theme.spacing(2),
    padding: theme.spacing(4),
    borderRadius: theme.radius.base,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.warning,
  },
  container: {
    flexGrow: 1,
    padding: theme.spacing(4),
    paddingBottom: theme.spacing(8),
    gap: theme.spacing(5),
  },
}));
