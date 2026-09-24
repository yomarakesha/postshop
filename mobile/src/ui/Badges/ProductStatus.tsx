import React from "react";
import Typography from "@/ui/Typography";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { TFunction } from "i18next";

type Variant = Extract<Product.Status, "pending" | "declined">;

type Props = {
  variant: Variant;
  t: TFunction;
};

const ProductStatusBadge = ({ variant, t }: Props) => {
  // Раньше фон брался через UnistylesRuntime.getTheme() прямо в рендере —
  // такой вызов не подписан на смену темы, и цвет бейджа «застывал».
  styles.useVariants({ variant });

  return (
    <View style={styles.container}>
      <Typography variant="t1" color="white" numberOfLines={1}>
        {t(`product.status.${variant}`)}
      </Typography>
    </View>
  );
};

export default ProductStatusBadge;

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingVertical: theme.spacing(1),
    paddingHorizontal: theme.spacing(2),
    borderRadius: theme.spacing(3),
    alignSelf: "flex-start",
    variants: {
      variant: {
        pending: { backgroundColor: theme.colors.warning },
        declined: { backgroundColor: theme.colors.failure },
        default: { backgroundColor: theme.colors.warning },
      },
    },
  },
}));
