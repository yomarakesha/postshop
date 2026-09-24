import React from "react";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Typography from "@/ui/Typography";
import { TFunction } from "i18next";
import { orderStatus } from "@/utils/orderStatus";
import { CurrencySource, formatMoney } from "@/utils/formatMoney";

type TypographyColor = React.ComponentProps<typeof Typography>["color"];

type Props = {
  status: Order.UIStatus;
  id: number;
  date: string;
  price: number;
  onPress: (id: number) => void;
  t: TFunction;
  partiallyRejected?: boolean;
  /** Валюта из товаров заказа; при отсутствии formatMoney подставит TMT. */
  currency?: CurrencySource;
};

// Цвет подписи статуса — статическая карта на варианты Typography.
// Раньше здесь лежал useMemo с зависимостью [status], который читал палитру
// через UnistylesRuntime.getTheme(): при переключении темы значения не
// пересчитывались, и карточка оставалась в цветах светлой палитры.
const statusTextColor: Record<Order.UIStatus, TypographyColor> = {
  pending: "warning",
  in_progress: "main",
  cancelled: "error",
  done: "success",
};

const Card = ({
  status,
  onPress,
  id,
  price,
  date,
  t,
  partiallyRejected,
  currency,
}: Props) => {
  const StatusIcon = orderStatus.client.getIcon(status);
  const label = orderStatus.client.getLabelKey(status);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container(status),
        pressed && styles.containerPressed,
      ]}
      onPress={() => onPress(id)}
    >
      <View style={styles.row}>
        <Typography weight="medium" numberOfLines={1} style={styles.flexible}>
          {t("order")} #{id}
        </Typography>
        <Typography weight="semiBold" numberOfLines={1} style={styles.fixed}>
          {formatMoney(price, currency)}
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
        <View style={styles.statusGroup}>
          {StatusIcon ? <StatusIcon width={20} height={20} /> : null}
          <Typography
            variant="t1"
            color={statusTextColor[status]}
            weight="semiBold"
            numberOfLines={1}
            style={styles.flexible}
          >
            {t(label)}
          </Typography>
        </View>
      </View>

      {partiallyRejected ? (
        <View style={styles.noticeRow}>
          <View style={styles.noticeMarker} />
          <Typography
            variant="t1"
            color="error"
            weight="medium"
            style={styles.flexible}
          >
            {t("client.orders.partiallyRejected")}
          </Typography>
        </View>
      ) : null}
    </Pressable>
  );
};

export default Card;

const styles = StyleSheet.create((theme) => {
  const statusBorderColor: Record<Order.UIStatus, string> = {
    pending: theme.colors.warning,
    in_progress: theme.colors.blueMain,
    cancelled: theme.colors.failure,
    done: theme.colors.success,
  };

  return {
    container: (status: Order.UIStatus) => ({
      borderRadius: theme.spacing(4),
      borderWidth: 1,
      borderColor: statusBorderColor[status],
      gap: theme.spacing(2),
      padding: theme.spacing(4),
      backgroundColor: theme.colors.white,
    }),
    containerPressed: {
      backgroundColor: theme.colors.gray2,
    },
    row: {
      justifyContent: "space-between",
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing(3),
    },
    statusGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing(1),
      flexShrink: 1,
    },
    // Длинные названия статусов (tk/tr) и длинные суммы больше не выдавливают
    // соседнюю колонку за пределы карточки: сжимается только текстовая часть.
    flexible: {
      flexShrink: 1,
    },
    fixed: {
      flexShrink: 0,
    },
    noticeRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: theme.spacing(2),
      marginTop: theme.spacing(1),
    },
    noticeMarker: {
      width: theme.spacing(1),
      alignSelf: "stretch",
      borderRadius: theme.spacing(1),
      backgroundColor: theme.colors.failure,
    },
  };
});
