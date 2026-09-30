import { productsApi } from "@/api/products";
import { receiptApi } from "@/api/receiptApi";
import SelectableSheet, {
  SelectableItem,
} from "@/components/BottomSheet/SelectableSheet";
import Header from "@/components/Header";
import { MAX_PAGE_SIZE } from "@/constants/pagination";
import { useConfirmationModal } from "@/store/useConfirmationModal";
import useShopStore from "@/store/useShopStore";
import ActivityIndicator from "@/ui/ActivityIndicator";
import Button from "@/ui/Button";
import EmptyState from "@/ui/EmptyState";
import RefreshControl from "@/ui/RefreshControl";
import Typography from "@/ui/Typography";
import ErrorAlert from "@/utils/errorAlert";
import OctagonXIcon from "@assets/icons/octagon-x.svg";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Pressable, View } from "react-native";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";
import AddItemSheet from "./_components/AddItemSheet";

/**
 * Приёмка на склад — как на витрине (`pages/my-store-receipts`).
 *
 * Магазин на складе платформы (FBO) отправляет товар на склад Postshop:
 * создаёт документ, добавляет товары, а подтверждает приём платформа — после
 * этого товар попадает в остаток. Пока документ не подтверждён, продавец
 * может убрать из него товар или отменить его целиком.
 */
const ShopReceiptsScreen = () => {
  const { t } = useTranslation();
  const shopId = useShopStore((s) => s.activeShopBaseId);
  const { data, isLoading, isRefetching, refetch } = receiptApi.useList(
    shopId!,
  );
  const warehousesQuery = receiptApi.useWarehouses(true);
  const productsQuery = productsApi.useGetMyInfiniteList({
    limit: MAX_PAGE_SIZE,
    skip: 0,
    shop_base_id: shopId!,
  });
  const products = useMemo(
    () => productsQuery.data?.pages.flat() ?? [],
    [productsQuery.data],
  );

  const createReceipt = receiptApi.useCreate();
  const deleteItem = receiptApi.useDeleteItem();
  const cancelReceipt = receiptApi.useCancel();

  const warehouseSheetRef = useRef<TrueSheet>(null);
  const itemSheetRef = useRef<TrueSheet>(null);
  const [activeReceiptId, setActiveReceiptId] = useState<number | null>(null);

  const warehouses: SelectableItem<number>[] = useMemo(
    () =>
      (warehousesQuery.data ?? []).map((w) => ({ key: w.id, value: w.name })),
    [warehousesQuery.data],
  );

  const onCreate = (warehouseId: number) =>
    createReceipt.mutate(
      { shop_id: shopId!, warehouse_id: warehouseId },
      {
        onSuccess: () =>
          Toast.show({ type: "success", text1: t("store.receipts.created") }),
        onError: (error) => ErrorAlert(t, error),
      },
    );

  const openAddItem = (receiptId: number) => {
    setActiveReceiptId(receiptId);
    itemSheetRef.current?.present();
  };

  const onCancel = (receiptId: number) =>
    useConfirmationModal.setState({
      isOpen: true,
      title: t("store.receipts.cancelTitle"),
      description: t("store.receipts.cancelText"),
      confirmTitle: t("store.receipts.cancel"),
      cancelTitle: t("common.no"),
      type: "danger",
      Icon: OctagonXIcon,
      onConfirm: () =>
        cancelReceipt.mutate(receiptId, {
          onSuccess: () =>
            Toast.show({
              type: "success",
              text1: t("store.receipts.cancelled"),
            }),
          onError: (error) => ErrorAlert(t, error),
        }),
    });

  const renderReceipt = ({ item: receipt }: { item: StockReceipt.Receipt }) => {
    const isDraft = receipt.status === "draft";
    return (
      <View style={styles.card}>
        <View>
          <Typography variant="p3" weight="semiBold">
            {t("store.receipts.number", { id: receipt.id })}
          </Typography>
          <Typography variant="t1" color="secondary">
            {t(`store.receipts.status.${receipt.status}`)}
            {receipt.warehouse_name ? ` · ${receipt.warehouse_name}` : ""}
          </Typography>
        </View>

        {receipt.items.length > 0 && (
          <View style={styles.items}>
            {receipt.items.map((item, index) => (
              <View
                key={item.id}
                style={styles.itemRow(index === receipt.items.length - 1)}
              >
                <Typography variant="t1" numberOfLines={1} style={styles.flex1}>
                  {item.product_name}
                </Typography>
                <Typography variant="t1" color="secondary">
                  {Number(item.quantity)} {item.measure_unit.code}
                </Typography>
                {isDraft && (
                  <Pressable
                    hitSlop={8}
                    disabled={deleteItem.isPending}
                    onPress={() =>
                      deleteItem.mutate(
                        { receiptId: receipt.id, itemId: item.id },
                        { onError: (error) => ErrorAlert(t, error) },
                      )
                    }
                  >
                    <Typography variant="t1" weight="medium" color="error">
                      {t("store.receipts.remove")}
                    </Typography>
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        )}

        {isDraft && (
          <>
            {/* Черновик ждёт платформу — говорим прямо, чтобы он не выглядел
                зависшим; пустой документ платформа не примет. */}
            <Typography
              variant="t2"
              color={receipt.items.length > 0 ? "secondary" : "error"}
            >
              {receipt.items.length > 0
                ? t("store.receipts.awaitingConfirmation")
                : t("store.receipts.addItemsFirst")}
            </Typography>
            <View style={styles.actions}>
              <Button
                title={t("store.receipts.addItem")}
                variant="secondary"
                onPress={() => openAddItem(receipt.id)}
              />
              <Button
                title={t("store.receipts.cancel")}
                variant="secondary"
                disabled={cancelReceipt.isPending}
                onPress={() => onCancel(receipt.id)}
              />
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <>
      <Header
        withGoBack
        title={t("store.receipts.title")}
        backgroundColor="white"
      />
      <FlatList
        data={data ?? []}
        renderItem={renderReceipt}
        keyExtractor={(receipt) => String(receipt.id)}
        style={styles.flex1}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Typography variant="t1" color="secondary">
              {t("store.receipts.subtitle")}
            </Typography>
            <Button
              title={t("store.receipts.create")}
              variant="primary"
              disabled={createReceipt.isPending || warehouses.length === 0}
              onPress={() => warehouseSheetRef.current?.present()}
            />
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator isFullScreen />
          ) : (
            <EmptyState title={t("store.receipts.empty")} />
          )
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      />
      <SelectableSheet
        ref={warehouseSheetRef}
        title={t("store.receipts.selectWarehouse")}
        data={warehouses}
        selectedKey={null}
        onSelect={onCreate}
      />
      <AddItemSheet
        ref={itemSheetRef}
        receiptId={activeReceiptId}
        products={products}
        t={t}
      />
    </>
  );
};

export default ShopReceiptsScreen;

const styles = StyleSheet.create((theme) => ({
  flex1: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(4),
    gap: theme.spacing(3),
  },
  header: {
    gap: theme.spacing(3),
  },
  card: {
    gap: theme.spacing(3),
    padding: theme.spacing(4),
    borderRadius: theme.radius.base,
    backgroundColor: theme.colors.white,
  },
  items: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.stroke,
  },
  itemRow: (isLast: boolean) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(3),
    paddingVertical: theme.spacing(2),
    borderBottomWidth: isLast ? 0 : 1,
    borderBottomColor: theme.colors.stroke,
  }),
  actions: {
    flexDirection: "row",
    gap: theme.spacing(2),
  },
}));
