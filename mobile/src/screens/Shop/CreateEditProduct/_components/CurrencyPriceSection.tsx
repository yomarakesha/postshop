import React from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Control, Controller } from "react-hook-form";
import CustomTextInput from "@/ui/CustomTextInput";
import Typography from "@/ui/Typography";
import { TFunction } from "i18next";
import SelectInput from "@/ui/SelectInput";
import { DEFAULT_CURRENCY_CODE } from "@/utils/formatMoney";

interface Props {
  control: Control<Product.Form.CreateBody>;
  t: TFunction;
  selectedCurrency?: Currency.Translation[];
  currencyCode?: string;
  onPressCurrency: () => void;
}

const CurrencyPriceSection = ({
  control,
  t,
  selectedCurrency,
  currencyCode,
  onPressCurrency,
}: Props) => (
  <View style={styles.container}>
    <View style={styles.field}>
      <Typography weight="medium">{t("currency")}</Typography>
      <SelectInput
        placeholder={t("common.select")}
        value={selectedCurrency?.find((tr) => tr.language === t("key"))?.name}
        onPress={onPressCurrency}
      />
    </View>
    <View style={styles.field}>
      <Typography weight="medium">
        {t("store.addEditProduct.price")}{" "}
        <Typography color="error">*</Typography>
      </Typography>
      <View style={styles.row}>
        <Controller
          control={control}
          name="price"
          rules={{ required: true, validate: (v) => v > 0 }}
          render={({ field: { onChange, value } }) => (
            <CustomTextInput
              placeholder="0"
              keyboardType="number-pad"
              flex
              value={value ? String(value) : ""}
              onChangeText={(v) => onChange(+v)}
            />
          )}
        />
        <View style={styles.currency}>
          <Typography variant="p3" weight="medium" numberOfLines={1}>
            {currencyCode ? currencyCode.toUpperCase() : DEFAULT_CURRENCY_CODE}
          </Typography>
        </View>
      </View>
    </View>
  </View>
);

export default CurrencyPriceSection;

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    backgroundColor: theme.colors.white,
    gap: theme.spacing(2),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  // Бейдж валюты был 40x40 рядом с полем высотой 48 — строка «съезжала».
  currency: {
    minWidth: 56,
    height: 48,
    paddingHorizontal: theme.spacing(2),
    borderRadius: theme.spacing(3),
    backgroundColor: theme.colors.blue2,
    alignItems: "center",
    justifyContent: "center",
  },
  field: { gap: theme.spacing(2) },
}));
