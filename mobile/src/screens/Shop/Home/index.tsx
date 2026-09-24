import React, { useMemo } from "react";
import { ScrollView } from "react-native";
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
import RefreshControl from "@/ui/RefreshControl";

const HomeScreen = () => {
  const shop = useShopStore((s) => s.shop);
  const user = useUserStore((s) => s.user);
  const { t } = useTranslation();
  const weeklyRevenueQuery = orderApi.useGetWeeklyRevenue(shop?.id!, {
    enabled: !!shop?.id,
  });
  const topProductsQuery = orderApi.useGetTopProducts(
    {
      limit: 5,
    },
    shop?.id!,
    { enabled: !!shop?.id },
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
  container: {
    flexGrow: 1,
    padding: theme.spacing(4),
    paddingBottom: theme.spacing(8),
    gap: theme.spacing(5),
  },
}));
