import React from "react";
import { Pressable, View } from "react-native";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import Typography from "@/ui/Typography";
import { TFunction } from "i18next";
import { orderStatus, SellerStatusView } from "@/utils/orderStatus";
import { formatMoney } from "@/utils/formatMoney";
import type { MoneyValue } from "@/utils/formatMoney";

type Props = {
  /** Что показать — см. orderStatus.seller.getView. */
  view: SellerStatusView;
  /**
   * Заказ ждёт действий продавца. Помечаем отдельной строкой: среди десятков
   * завершённых новый заказ терялся, хотя его нужно принять.
   */
  needsAction?: boolean;
  id: number;
  date: string;
  price: MoneyValue;
  onPress: (id: number) => void;
  t: TFunction;
};

const Card = ({ view, needsAction, onPress, id, price, date, t }: Props) => {
  const theme = UnistylesRuntime.getTheme();
  const color = orderStatus.seller.getToneColor(view.tone, theme);
  const StatusIcon = view.Icon;

  return (
    <Pressable style={styles.container(color)} onPress={() => onPress(id)}>
      <View style={styles.row}>
        <Typography weight="medium" numberOfLines={1} style={styles.shrink}>
          {t("order")} #{id}
        </Typography>
        <Typography weight="semiBold" numberOfLines={1}>
          {formatMoney(price)}
        </Typography>
      </View>
      <View style={styles.row}>
        <Typography
          variant="t1"
          color="secondary"
          weight="medium"
          numberOfLines={1}
          style={styles.fixed}
        >
          {date}
        </Typography>
        <View style={styles.statusRow}>
          <StatusIcon width={20} height={20} style={styles.statusIcon(color)} />
          {/* Подписи вида «Собран — передайте оператору» длиннее прежних:
              сжимается текст, а не дата слева. */}
          <Typography
            variant="t1"
            color={view.tone}
            weight="semiBold"
            numberOfLines={1}
            style={styles.shrink}
          >
            {t(view.labelKey)}
          </Typography>
        </View>
      </View>
      {needsAction ? (
        <View style={styles.noticeRow}>
          <View style={styles.noticeMarker} />
          <Typography variant="t1" color="warning" weight="medium">
            {t("store.orders.needsAction")}
          </Typography>
        </View>
      ) : null}
    </Pressable>
  );
};

export default Card;

const styles = StyleSheet.create((theme) => ({
  container: (color: string) => ({
    borderRadius: theme.spacing(4),
    borderWidth: 1,
    borderColor: color,
    gap: theme.spacing(2),
    padding: theme.spacing(4),
    backgroundColor: theme.colors.white,
  }),
  row: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(1),
    flexShrink: 1,
  },
  shrink: {
    flexShrink: 1,
  },
  fixed: {
    flexShrink: 0,
  },
  statusIcon: (color: string) => ({
    color,
  }),
  noticeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  noticeMarker: {
    width: theme.spacing(1),
    alignSelf: "stretch",
    borderRadius: theme.spacing(1),
    backgroundColor: theme.colors.warning,
  },
}));
