import React from "react";
import Typography from "@/ui/Typography";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { TFunction } from "i18next";
import ActivityIndicator from "@/ui/ActivityIndicator";
import { formatMoney } from "@/utils/formatMoney";
import type { CurrencySource, MoneyValue } from "@/utils/formatMoney";

/**
 * Виджет недельной выручки.
 *
 * Раньше здесь жил столбчатый график и бейдж с приростом — оба на выдуманных
 * данных: `percentage` приходил захардкоженным (4.2), а массив для графика был
 * закомментирован, из-за чего на экране оставался пустой синий прямоугольник.
 * Эндпоинт `/orders/shop/{id}/weekly-revenue` отдаёт только сумму, количество
 * заказов и границы периода (см. `Order.API.GetWeeklyRevenueResponse`) —
 * поразрядных данных по дням нет, поэтому график вернуть не из чего.
 * Вместо выдуманного процента показываем реальное число заказов за период.
 */
type RevenueWidgetProps = {
  amount: MoneyValue;
  currency?: CurrencySource;
  ordersCount?: number;
  isLoading?: boolean;
  t: TFunction;
};

const RevenueWidget = ({
  amount,
  currency,
  ordersCount,
  isLoading = false,
  t,
}: RevenueWidgetProps) => {
  const hasOrders = typeof ordersCount === "number" && ordersCount > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Typography variant="p2" weight="semiBold">
          {t("store.home.incomeReport.title")}
        </Typography>
        <Typography variant="t1" color="secondary">
          {t("store.home.incomeReport.subtitle")}
        </Typography>
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator />
        </View>
      ) : (
        <View style={styles.amountRow}>
          <Typography
            variant="h1"
            weight="bold"
            numberOfLines={1}
            style={styles.amount}
          >
            {formatMoney(amount, currency)}
          </Typography>
          {hasOrders && (
            <View style={styles.badge}>
              <Typography variant="t1" weight="medium" color="main">
                {t("store.home.incomeReport.ordersCount", {
                  value: ordersCount,
                })}
              </Typography>
            </View>
          )}
        </View>
      )}

      {!isLoading && !hasOrders && (
        <Typography variant="t1" color="tertiary">
          {t("store.home.incomeReport.empty")}
        </Typography>
      )}
    </View>
  );
};

export default RevenueWidget;

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing(3),
    padding: theme.spacing(4),
    gap: theme.spacing(3),
    ...theme.shadows.hard,
  },
  header: {
    gap: theme.spacing(1),
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
  },
  amount: {
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: theme.spacing(2),
    paddingVertical: theme.spacing(1),
    borderRadius: theme.spacing(2),
    backgroundColor: theme.colors.blue2,
  },
  loader: {
    paddingVertical: theme.spacing(3),
    alignItems: "flex-start",
  },
}));
