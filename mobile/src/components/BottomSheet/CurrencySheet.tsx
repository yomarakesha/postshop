import { MAX_PAGE_SIZE } from "@/constants/pagination";
import React from "react";
import Typography from "@/ui/Typography";
import { Pressable, ScrollView } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import HeaderSheet from "./HeaderSheet";
import { UniTrueSheet } from "@/ui/BottomSheet";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { TFunction } from "i18next";
import { currencyApi } from "@/api/currencyApi";
import ActivityIndicator from "@/ui/ActivityIndicator";

type Props = {
  ref: React.RefObject<TrueSheet | null>;
  onSelect: (
    brandId: number,
    translations: Currency.Translation[],
    code: string,
  ) => void;
  t: TFunction;
};

const CurrencySheet = ({ ref, onSelect, t }: Props) => {
  const currenciesQuery = currencyApi.useGetAll({
    skip: 0,
    limit: MAX_PAGE_SIZE,
  });

  const onClose = () => {
    ref.current?.dismiss();
  };

  const data = currenciesQuery.data || [];

  return (
    <UniTrueSheet
      ref={ref}
      scrollable
      detents={[0.5, 1]}
      style={styles.wrapper}
    >
      <HeaderSheet title={t("currency")} onClose={onClose} />
      {currenciesQuery.isPending ? (
        <ActivityIndicator style={styles.loader} />
      ) : null}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {data.map((item, index) => (
          <Pressable
            style={styles.item(index === data.length - 1)}
            key={item.id}
            onPress={() => onSelect(item.id, item.translations, item.code)}
          >
            <Typography weight="medium">
              {/* Без запасного варианта строка валюты оставалась пустой,
                  если для текущего языка перевода нет. */}
              {item.translations.find((tr) => tr.language === t("key"))?.name ??
                item.translations[0]?.name ??
                item.code}
            </Typography>
          </Pressable>
        ))}
      </ScrollView>
    </UniTrueSheet>
  );
};

export default CurrencySheet;

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    paddingHorizontal: theme.spacing(4),
    paddingTop: 0,
    // Без нижнего отступа последняя строка списка упиралась в край шторки.
    paddingBottom: theme.spacing(4),
  },
  loader: {
    paddingVertical: theme.spacing(6),
  },
  contentContainer: {
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
  }),
  logoContainer: {
    width: 70,
    height: 40,
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing(2),
    padding: theme.spacing(1),
  },
  logo: {
    width: "100%",
    height: "100%",
  },
}));
