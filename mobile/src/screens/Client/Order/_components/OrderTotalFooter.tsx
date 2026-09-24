import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { TFunction } from "i18next";
import Typography from "@/ui/Typography";
import {
  formatMoney,
  formatMoneyDiscount,
  roundMoney,
} from "@/utils/formatMoney";

type TypographyProps = React.ComponentProps<typeof Typography>;

type RowProps = {
  label: string;
  value: string;
  color?: TypographyProps["color"];
  weight?: TypographyProps["weight"];
  isUnderlined?: boolean;
};

const Row = ({
  label,
  value,
  color,
  weight = "regular",
  isUnderlined,
}: RowProps) => (
  <View style={styles.row}>
    <Typography
      variant="p2"
      weight={weight}
      color={color}
      isUnderlined={isUnderlined}
      numberOfLines={2}
      style={styles.label}
    >
      {label}
    </Typography>
    <Typography
      variant="p2"
      weight={weight}
      color={color}
      isUnderlined={isUnderlined}
      numberOfLines={1}
      style={styles.value}
    >
      {value}
    </Typography>
  </View>
);

type Props = {
  total: string;
  effectiveTotal: string;
  t: TFunction;
  style?: StyleProp<ViewStyle>;
};

const OrderTotalFooter = ({ total, effectiveTotal, t, style }: Props) => {
  const totalNum = roundMoney(total);
  const effectiveNum = roundMoney(effectiveTotal);
  const discount = roundMoney(totalNum - effectiveNum);

  return (
    <View style={[styles.container, style]}>
      <Typography variant="p1" weight="bold">
        {t("client.order.footer.title")}
      </Typography>

      <Row
        label={t("client.order.footer.goodsPrice")}
        value={formatMoney(totalNum)}
      />

      {discount !== 0 && (
        <>
          <View style={styles.divider} />
          <Row
            label={t("client.order.footer.discount")}
            value={formatMoneyDiscount(discount)}
            color="error"
          />
        </>
      )}

      <View style={styles.divider} />

      <Row
        label={t("client.order.footer.grandTotal")}
        value={formatMoney(effectiveNum)}
        weight="bold"
      />
    </View>
  );
};

export default OrderTotalFooter;

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing(3),
    paddingTop: theme.spacing(2),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing(3),
  },
  label: {
    flexShrink: 1,
  },
  value: {
    flexShrink: 0,
  },
  divider: {
    height: 1,
    // Был passive1 — это токен цвета текста, линия получалась почти чёрной.
    backgroundColor: theme.colors.stroke,
  },
}));
