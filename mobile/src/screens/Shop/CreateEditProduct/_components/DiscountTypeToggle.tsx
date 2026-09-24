import React from "react";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Typography from "@/ui/Typography";
import { TFunction } from "i18next";

type Props = {
  value: Product.DiscountType;
  onChange: (type: Product.DiscountType) => void;
  t: TFunction;
};

const DiscountTypeToggle = ({ value, onChange, t }: Props) => {
  return (
    <View style={styles.container}>
      <Pressable
        style={styles.option(value === "percentage")}
        onPress={() => onChange("percentage")}
      >
        <Typography color={value === "percentage" ? "white" : "secondary"}>
          {t("store.addEditProduct.discount.percentage")}
        </Typography>
      </Pressable>
      <Pressable
        style={styles.option(value === "fixed")}
        onPress={() => onChange("fixed")}
      >
        <Typography color={value === "fixed" ? "white" : "secondary"}>
          {t("store.addEditProduct.discount.fixed")}
        </Typography>
      </Pressable>
    </View>
  );
};

export default DiscountTypeToggle;

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    backgroundColor: theme.colors.gray2,
    borderRadius: theme.spacing(3),
    padding: theme.spacing(0.5),
  },
  option: (active: boolean) => ({
    paddingHorizontal: theme.spacing(3),
    paddingVertical: theme.spacing(2),
    borderRadius: theme.spacing(2.5),
    backgroundColor: active ? theme.colors.blueMain : "transparent",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  }),
}));
