import React from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Control, Controller } from "react-hook-form";
import { AxiosError } from "axios";
import { TFunction } from "i18next";
import CustomTextInput from "@/ui/CustomTextInput";
import Typography from "@/ui/Typography";

/** Длины, которые принимает сервер: EAN-8, UPC-A, EAN-13, GTIN-14. */
const VENDOR_BARCODE_LENGTHS = [8, 12, 13, 14];

/** Пробелы сервер всё равно вырезает — вырезаем и мы, чтобы проверка совпала. */
export const normalizeVendorBarcode = (value: string | null | undefined) =>
  (value ?? "").replace(/\s+/g, "");

/** Пустое поле допустимо: штрихкод производителя необязателен. */
export const isVendorBarcodeValid = (value: string | null | undefined) => {
  const code = normalizeVendorBarcode(value);
  if (!code) return true;
  return /^\d+$/.test(code) && VENDOR_BARCODE_LENGTHS.includes(code.length);
};

/**
 * Понятный текст отказа сервера при сохранении товара.
 *
 * Раньше любая ошибка показывалась одним «Ошибка» — продавец не узнавал, что
 * товар с таким штрихкодом у него уже есть (409) или что код неверный (422).
 * Для штрихкода отдаём свой перевод, для прочих отказов — текст сервера.
 * `field: "vendor_barcode"` — чтобы экран подсветил именно это поле.
 */
export const productSaveError = (
  t: TFunction,
  error: unknown,
): { message?: string; field?: "vendor_barcode" } => {
  const response = (error as AxiosError<{ detail?: unknown }>)?.response;
  const detail = response?.data?.detail;
  const text =
    typeof detail === "string"
      ? detail
      : Array.isArray(detail) && detail[0]?.msg
        ? String(detail[0].msg)
        : undefined;

  if (response?.status === 409 && text?.toLowerCase().includes("barcode")) {
    return {
      message: t("store.addEditProduct.barcode.duplicate"),
      field: "vendor_barcode",
    };
  }
  if (text?.startsWith("vendor_barcode:")) {
    return {
      message: t("store.addEditProduct.barcode.invalid"),
      field: "vendor_barcode",
    };
  }
  return { message: text };
};

interface Props {
  control: Control<Product.Form.CreateBody>;
  /** Штрихкод Postshop (только при редактировании) — его нельзя менять. */
  platformBarcode?: string | null;
  /** Отказ сервера по штрихкоду (дубль, неверный код); сбрасывается экраном. */
  serverError?: string;
  t: TFunction;
}

const BarcodeSection = ({
  control,
  platformBarcode,
  serverError,
  t,
}: Props) => (
  <View style={styles.container}>
    {!!platformBarcode && (
      <View style={styles.field}>
        <Typography weight="medium">
          {t("store.addEditProduct.barcode.platformLabel")}
        </Typography>
        <CustomTextInput value={platformBarcode} disabled />
        <Typography variant="t1" color="secondary">
          {t("store.addEditProduct.barcode.platformHint")}
        </Typography>
      </View>
    )}
    <View style={styles.field}>
      <Typography weight="medium">
        {t("store.addEditProduct.barcode.vendorLabel")}
      </Typography>
      <Controller
        control={control}
        name="vendor_barcode"
        rules={{ validate: (v) => isVendorBarcodeValid(v) }}
        render={({ field: { onChange, onBlur, value } }) => {
          const invalid = !isVendorBarcodeValid(value);
          const error = invalid
            ? t("store.addEditProduct.barcode.invalid")
            : serverError;
          return (
            <>
              <CustomTextInput
                placeholder={t(
                  "store.addEditProduct.barcode.vendorPlaceholder",
                )}
                value={value ?? ""}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="number-pad"
                inputMode="numeric"
                // 14 цифр GTIN-14 плюс запас на пробелы при вставке кода.
                maxLength={20}
              />
              <Typography variant="t1" color={error ? "error" : "secondary"}>
                {error ?? t("store.addEditProduct.barcode.vendorHint")}
              </Typography>
            </>
          );
        }}
      />
    </View>
  </View>
);

export default BarcodeSection;

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    backgroundColor: theme.colors.white,
    gap: theme.spacing(3),
  },
  field: { gap: theme.spacing(2) },
}));
