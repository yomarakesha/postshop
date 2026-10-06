import { stockApi } from "@/api/stockApi";
import HeaderSheet from "@/components/BottomSheet/HeaderSheet";
import useAppStore from "@/store/useAppStore";
import ActivityIndicator from "@/ui/ActivityIndicator";
import { UniTrueSheet } from "@/ui/BottomSheet";
import Typography from "@/ui/Typography";
import { formatApiDate } from "@/utils/formatDate";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { TFunction } from "i18next";
import React, { RefObject, useEffect } from "react";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export type StockHistoryTarget = { productId: number; name: string };

type Props = {
  ref: RefObject<TrueSheet | null>;
  shopId: number;
  target: StockHistoryTarget | null;
  /** FBO — движения по складам Postshop, FBS — журнал самого магазина. */
  isFbo: boolean;
  t: TFunction;
};

/** Эти операции увеличивают остаток; пересчёт несёт знак в самом количестве. */
const INCOMING = new Set(["income", "return_from_customer"]);

const isPlus = (op: Stock.Operation) =>
  op.operation_type === "correction"
    ? Number(op.quantity) >= 0
    : INCOMING.has(op.operation_type);

/**
 * История движений товара — как на витрине (`widgets/StockHistoryModal`).
 *
 * Продавец видел только итоговое число. У FBO к тому же платформа списывает
 * брак и возвращает товар, и об этом продавец не знал вовсе.
 */
const StockHistorySheet = ({ ref, shopId, target, isFbo, t }: Props) => {
  const language = useAppStore((s) => s.lang);
  const history = stockApi.useHistory(shopId, target?.productId, isFbo);
  const operations = history.data ?? [];

  // Лист всегда смонтирован, и ответ брался из кэша: после пересчёта или
  // списания история показывала старое. Каждое открытие перечитывает её.
  useEffect(() => {
    if (target) void history.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return (
    <UniTrueSheet ref={ref} detents={[0.7, 1]} style={styles.wrapper}>
      <HeaderSheet
        title={t("store.stockHistory.title")}
        onClose={() => ref.current?.dismiss()}
      />
      {target && (
        <Typography variant="p3" color="secondary" numberOfLines={2}>
          {target.name}
        </Typography>
      )}
      {history.isLoading ? (
        <ActivityIndicator />
      ) : operations.length === 0 ? (
        <Typography variant="t1" color="secondary" style={styles.empty}>
          {t("store.stockHistory.empty")}
        </Typography>
      ) : (
        <ScrollView nestedScrollEnabled contentContainerStyle={styles.list}>
          {operations.map((op) => {
            const plus = isPlus(op);
            const amount = Math.abs(Number(op.quantity));
            return (
              <View key={op.id} style={styles.row}>
                <View style={styles.flex1}>
                  <Typography variant="p3">
                    {t(`store.stockHistory.op.${op.operation_type}`)}
                  </Typography>
                  <Typography variant="t2" color="secondary">
                    {formatApiDate(op.created_at, language, {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </Typography>
                </View>
                <Typography
                  variant="p3"
                  weight="semiBold"
                  color={plus ? "success" : "error"}
                >
                  {plus ? "+" : "−"}
                  {amount} {op.measure_unit.code}
                </Typography>
              </View>
            );
          })}
        </ScrollView>
      )}
    </UniTrueSheet>
  );
};

export default StockHistorySheet;

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    paddingHorizontal: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    paddingTop: 0,
    gap: theme.spacing(2),
  },
  empty: {
    marginTop: theme.spacing(3),
  },
  list: {
    paddingBottom: theme.spacing(6),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(3),
    paddingVertical: theme.spacing(2),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.stroke,
  },
  flex1: {
    flex: 1,
  },
}));
