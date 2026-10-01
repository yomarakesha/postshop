import { returnApi } from "@/api/returnApi";
import Header from "@/components/Header";
import useShopStore from "@/store/useShopStore";
import ActivityIndicator from "@/ui/ActivityIndicator";
import EmptyState from "@/ui/EmptyState";
import RefreshControl from "@/ui/RefreshControl";
import Typography from "@/ui/Typography";
import useAppStore from "@/store/useAppStore";
import { formatApiDate } from "@/utils/formatDate";
import Button from "@/ui/Button";
import { useConfirmationModal } from "@/store/useConfirmationModal";
import PackageCheckIcon from "@assets/icons/package-check.svg";
import OctagonXIcon from "@assets/icons/octagon-x.svg";
import Toast from "react-native-toast-message";
import ErrorAlert from "@/utils/errorAlert";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, ListRenderItem, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

/**
 * Возвраты по товарам магазина — как на витрине (`pages/my-store-returns`).
 *
 * Об оформленном возврате продавцу приходит уведомление, а посмотреть, по
 * какому товару и почему, в приложении было негде. Решение по заявке
 * принимает платформа. Одобрение остаток не меняет — товар ещё в пути;
 * продавец FBS сам отмечает, что товар вернулся, и решает: снова в продажу
 * или брак. Возврат FBO получает склад Postshop — у продавца только пояснение.
 */
const ShopReturnsScreen = () => {
  const { t } = useTranslation();
  const shopBaseId = useShopStore((s) => s.activeShopBaseId);
  const lang = useAppStore((s) => s.lang);
  const { data, isLoading, isRefetching, refetch } = returnApi.useShopReturns(
    shopBaseId!,
  );
  const { mutateAsync: receive, isPending: isReceiving } = returnApi.useReceive(
    shopBaseId!,
  );

  // Подтверждение обязательно: отметку о получении не отменить, а «в
  // продажу» сразу увеличивает остаток — товар начнут покупать.
  const confirmReceive = useCallback(
    (item: ReturnRequest.Item, restock: boolean) => {
      useConfirmationModal.setState({
        isOpen: true,
        type: restock ? "success" : "danger",
        Icon: restock ? PackageCheckIcon : OctagonXIcon,
        title: t(
          restock
            ? "store.returns.receive.confirmRestockTitle"
            : "store.returns.receive.confirmDefectiveTitle",
        ),
        description: restock
          ? t("store.returns.receive.confirmRestockDescription", {
              count: Number(item.quantity),
            })
          : t("store.returns.receive.confirmDefectiveDescription"),
        confirmTitle: t("store.returns.receive.confirm"),
        cancelTitle: t("common.no"),
        onConfirm: async () => {
          try {
            await receive({ id: item.id, restock });
            Toast.show({
              type: "success",
              text1: t("store.returns.receive.saved"),
            });
          } catch (e) {
            ErrorAlert(t, e as any);
          }
        },
      });
    },
    [receive, t],
  );

  // Что после одобрения: получен ли товар назад и кто его получает.
  const renderReceive = useCallback(
    (item: ReturnRequest.Item) => {
      if (item.received_at) {
        const date = formatApiDate(item.received_at, lang, {
          dateStyle: "medium",
        });
        return (
          <View style={styles.receiveBox}>
            <Typography
              variant="t1"
              weight="medium"
              color={item.restocked ? "success" : "error"}
            >
              {t(
                item.restocked
                  ? "store.returns.receive.restocked"
                  : "store.returns.receive.defectiveDone",
                { date },
              )}
            </Typography>
          </View>
        );
      }
      if (item.warehouse_type === "fbo") {
        return (
          <View style={styles.receiveBox}>
            <Typography variant="t1" color="secondary">
              {t("store.returns.receive.fbo")}
            </Typography>
          </View>
        );
      }
      return (
        <View style={styles.receiveBox}>
          <Typography variant="t1" color="secondary">
            {t("store.returns.receive.awaiting")}
          </Typography>
          <Button
            variant="primary"
            title={t("store.returns.receive.restock")}
            disabled={isReceiving}
            onPress={() => confirmReceive(item, true)}
          />
          <Button
            variant="secondary"
            title={t("store.returns.receive.defective")}
            disabled={isReceiving}
            onPress={() => confirmReceive(item, false)}
          />
        </View>
      );
    },
    [t, lang, isReceiving, confirmReceive],
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
              {formatApiDate(item.created_at, lang, { dateStyle: "medium" })}
            </Typography>
          )}
          {item.status === "approved" ? renderReceive(item) : null}
        </View>
      );
    },
    [t, lang, renderReceive],
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
  // Отделяем блок получения от текста заявки: это уже не «что просили»,
  // а «что сделать сейчас».
  receiveBox: {
    gap: theme.spacing(2),
    paddingTop: theme.spacing(2),
    borderTopWidth: 1,
    borderTopColor: theme.colors.stroke,
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
