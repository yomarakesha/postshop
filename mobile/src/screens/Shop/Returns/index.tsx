import { returnApi } from "@/api/returnApi";
import Header from "@/components/Header";
import useShopStore from "@/store/useShopStore";
import ActivityIndicator from "@/ui/ActivityIndicator";
import EmptyState from "@/ui/EmptyState";
import RefreshControl from "@/ui/RefreshControl";
import Typography from "@/ui/Typography";
import useAppStore from "@/store/useAppStore";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, ListRenderItem, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

/**
 * Возвраты по товарам магазина — как на витрине (`pages/my-store-returns`).
 *
 * Об оформленном возврате продавцу приходит уведомление, а посмотреть, по
 * какому товару и почему, в приложении было негде. Экран только для чтения:
 * решение по заявке принимает платформа, и кнопок, которые продавцу ничего не
 * дадут, здесь нет.
 */
const ShopReturnsScreen = () => {
  const { t } = useTranslation();
  const shopBaseId = useShopStore((s) => s.activeShopBaseId);
  const lang = useAppStore((s) => s.lang);
  const { data, isLoading, isRefetching, refetch } = returnApi.useShopReturns(
    shopBaseId!,
  );
  const dateFormat = useMemo(
    () => new Intl.DateTimeFormat(lang ?? undefined, { dateStyle: "medium" }),
    [lang],
  );

  const renderItem: ListRenderItem<ReturnRequest.Item> = useCallback(
    ({ item }) => {
      const buyer = [item.buyer_name, item.buyer_phone]
        .filter(Boolean)
        .join(" · ");
      return (
        <View style={styles.card}>
          <View style={styles.top}>
            <View style={styles.title}>
              <Typography variant="p3" weight="medium">
                {item.product_name || t("store.returns.unknownProduct")}
              </Typography>
              <Typography variant="t1" color="secondary">
                {t("store.returns.quantityShort", {
                  count: Number(item.quantity),
                })}
                {item.order_id
                  ? ` · ${t("store.returns.fromOrder", { id: item.order_id })}`
                  : ""}
              </Typography>
            </View>
            <View style={styles.status(item.status)}>
              <Typography
                variant="t2"
                weight="medium"
                color={
                  item.status === "approved"
                    ? "main"
                    : item.status === "rejected"
                      ? "error"
                      : "secondary"
                }
              >
                {t(`store.returns.status.${item.status}`)}
              </Typography>
            </View>
          </View>
          {/* Кто вернул: без этого продавец не может ни связаться с
              человеком, ни сопоставить возврат с заказом. */}
          {!!buyer && (
            <Typography variant="t1" color="secondary">
              {buyer}
            </Typography>
          )}
          <Typography variant="t1">{item.reason}</Typography>
          {!!item.resolution_comment && (
            <Typography
              variant="t1"
              color={item.status === "rejected" ? "error" : "secondary"}
            >
              {item.resolution_comment}
            </Typography>
          )}
          {!!item.created_at && (
            <Typography variant="t2" color="tertiary">
              {dateFormat.format(new Date(item.created_at))}
            </Typography>
          )}
        </View>
      );
    },
    [t, dateFormat],
  );

  return (
    <>
      <Header
        withGoBack
        title={t("store.returns.title")}
        backgroundColor="white"
      />
      <FlatList
        data={data ?? []}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        style={styles.list}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <Typography variant="t1" color="secondary">
            {t("store.returns.subtitle")}
          </Typography>
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator isFullScreen />
          ) : (
            <EmptyState title={t("store.returns.empty")} />
          )
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      />
    </>
  );
};

export default ShopReturnsScreen;

const styles = StyleSheet.create((theme) => ({
  list: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(4),
    gap: theme.spacing(3),
  },
  card: {
    gap: theme.spacing(2),
    padding: theme.spacing(4),
    borderRadius: theme.radius.base,
    backgroundColor: theme.colors.white,
  },
  top: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing(3),
  },
  title: {
    flex: 1,
    gap: theme.spacing(0.5),
  },
  status: (status: ReturnRequest.Status) => ({
    paddingVertical: theme.spacing(1),
    paddingHorizontal: theme.spacing(2.5),
    borderRadius: 999,
    backgroundColor:
      status === "approved"
        ? theme.colors.blue1
        : status === "rejected"
          ? theme.colors.failure + "14"
          : theme.colors.gray2,
  }),
}));
