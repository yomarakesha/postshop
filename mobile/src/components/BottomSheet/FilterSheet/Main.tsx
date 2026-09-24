import React from "react";
import Typography from "@/ui/Typography";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import HeaderSheet from "../HeaderSheet";
import { SheetsMap } from ".";
import RightChevronIcon from "@assets/icons/right-chevron.svg";
import CustomTextInput from "@/ui/CustomTextInput";
import { ProductFilterType } from "@/store/useProductListStore";
import { TFunction } from "i18next";
import ClearSaveActions from "@/ui/ClearSaveActions";

type Props = {
  onClose: () => void;
  sheets: SheetsMap[];
  filter: Partial<ProductFilterType>;
  onChangeMinPrice: (price: string) => void;
  onChangeMaxPrice: (price: string) => void;
  minPriceValue: number | null;
  maxPriceValue: number | null;
  onSubmit: () => void;
  onClear: () => void;
  t: TFunction;
};

const MainFilterSheet = ({
  onClose,
  sheets,
  filter,
  minPriceValue,
  maxPriceValue,
  onChangeMaxPrice,
  onChangeMinPrice,
  onSubmit,
  onClear,
  t,
}: Props) => {
  return (
    <>
      <HeaderSheet title={t("sheets.filter.title")} onClose={onClose} />
      <View style={styles.container}>
        {sheets.map((sheet) => {
          if (!sheet.isVisible) return null;
          const subtitle =
            sheet.label === t("brand")
              ? filter.brands?.map((b) => b.name).join(", ")
              : sheet.label === t("shop")
                ? filter.shops?.map((s) => s.name).join(", ")
                : "";

          return (
            <Pressable
              key={sheet.label}
              onPress={sheet.onPress}
              style={styles.item(false)}
            >
              <Typography variant="p3" weight="medium">
                {sheet.label}
              </Typography>
              {!!subtitle && (
                <Typography
                  variant="p3"
                  color="tertiary"
                  numberOfLines={1}
                  style={styles.subtitle}
                >
                  {subtitle}
                </Typography>
              )}
              <RightChevronIcon style={styles.chevronIcon} />
            </Pressable>
          );
        })}
        <View style={styles.inputsWrapper}>
          <Typography weight="medium">
            {t("sheets.filter.priceRange")}
          </Typography>
          <View style={styles.inputRow}>
            <CustomTextInput
              placeholder={t("sheets.filter.priceFrom")}
              value={minPriceValue ? String(minPriceValue) : ""}
              onChangeText={onChangeMinPrice}
              flex
              containerStyle={styles.input}
            />
            <CustomTextInput
              placeholder={t("sheets.filter.priceTo")}
              value={maxPriceValue ? String(maxPriceValue) : ""}
              onChangeText={onChangeMaxPrice}
              flex
              containerStyle={styles.input}
            />
          </View>
        </View>
      </View>

      <ClearSaveActions t={t} onClear={onClear} onSave={onSubmit} />
    </>
  );
};

export default MainFilterSheet;

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: theme.spacing(4),
    borderRadius: theme.spacing(4),
    backgroundColor: theme.colors.gray2,
  },
  item: (isLast: boolean) => ({
    paddingVertical: theme.spacing(4),
    borderBottomWidth: isLast ? 0 : 1,
    borderBottomColor: theme.colors.stroke,
    gap: theme.spacing(2),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  }),
  inputsWrapper: {
    // Было spacing(6): между подписью «Диапазон цен» и самими полями зияла
    // дыра в 24px, вдвое больше остальных отступов шторки.
    gap: theme.spacing(3),
    paddingVertical: theme.spacing(4),
  },
  subtitle: {
    flex: 1,
    textAlign: "right",
  },
  inputRow: {
    gap: theme.spacing(2),
    flexDirection: "row",
    alignItems: "center",
  },
  chevronIcon: {
    color: theme.colors.gray4,
  },
  input: {
    backgroundColor: theme.colors.white,
  },
}));
