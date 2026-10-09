import React, { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native-unistyles";
import { UniTrueSheet } from "@/ui/BottomSheet";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import MainFilterSheet from "./Main";
import BrandsFilterSheet from "./Brands";
import {
  ProductFilterType,
  useProductListStore,
} from "@/store/useProductListStore";
import ShopsFilterSheet from "./Shops";
import { TFunction } from "i18next";

type Props = {
  ref: React.RefObject<TrueSheet | null>;
  onDidDismiss?: () => void;
  withoutBrands?: boolean;
  withoutShops?: boolean;
  t: TFunction;
};

export type SheetsMap = {
  label: string;
  onPress: () => void;
  isVisible: boolean;
};

const FilterSheet = ({
  ref,
  onDidDismiss,
  withoutBrands = false,
  withoutShops = false,
  t,
}: Props) => {
  const currentFilter = useProductListStore((s) => s.filter);
  const [filter, setFilter] = useState<ProductFilterType>(currentFilter);
  // Фильтр могут сбросить и снаружи (кнопка на пустом списке): без этого
  // шторка открывалась со старыми значениями и «Применить» возвращала их.
  useEffect(() => {
    setFilter(currentFilter);
  }, [currentFilter]);
  const brandsRef = useRef<TrueSheet | null>(null);
  const shopBasesRef = useRef<TrueSheet | null>(null);

  const sheetsMap: SheetsMap[] = [
    {
      label: t("shop"),
      onPress: () => shopBasesRef.current?.present(),
      isVisible: !withoutShops,
    },
    {
      label: t("brand"),
      onPress: () => brandsRef.current?.present(),
      isVisible: !withoutBrands,
    },
  ];

  const onSaveBrands = (brands: { id: number; name: string }[]) => {
    setFilter((prev) => ({ ...prev, brands }));
  };

  const onSaveShops = (shops: { id: number; name: string }[]) => {
    setFilter((prev) => ({ ...prev, shops }));
  };

  // Пустое поле — «без границы», а не 0: иначе стёртая цена оставляла фильтр
  // включённым, и экран показывал пустой список как отфильтрованный.
  const toPrice = (price: string) => (price.trim() === "" ? null : Number(price));

  const onChangeMinPrice = (price: string) =>
    setFilter((prev) => ({ ...prev, priceFrom: toPrice(price) }));

  const onChangeMaxPrice = (price: string) =>
    setFilter((prev) => ({ ...prev, priceTo: toPrice(price) }));

  const onSubmit = () => {
    useProductListStore.setState({ filter });
    TrueSheet.dismissAll();
  };

  const onClear = () =>
    setFilter({ shops: null, brands: null, priceFrom: null, priceTo: null });

  const onClose = () => TrueSheet.dismissAll();

  return (
    <>
      <UniTrueSheet
        ref={ref}
        detents={["auto"]}
        style={styles.bottomSheet}
        onDidDismiss={onDidDismiss || onClose}
      >
        <MainFilterSheet
          onClose={onClose}
          sheets={sheetsMap}
          filter={filter}
          minPriceValue={filter.priceFrom}
          maxPriceValue={filter.priceTo}
          onChangeMaxPrice={onChangeMaxPrice}
          onChangeMinPrice={onChangeMinPrice}
          onSubmit={onSubmit}
          onClear={onClear}
          t={t}
        />
      </UniTrueSheet>

      <BrandsFilterSheet
        ref={brandsRef}
        onClose={onClose}
        onSave={onSaveBrands}
        initialSelected={filter.brands || []}
        t={t}
      />
      <ShopsFilterSheet
        ref={shopBasesRef}
        onClose={onClose}
        onSave={onSaveShops}
        initialSelected={filter.shops || []}
        t={t}
      />
    </>
  );
};

export default FilterSheet;

const styles = StyleSheet.create((theme, rt) => ({
  bottomSheet: {
    paddingHorizontal: theme.spacing(4),
    paddingTop: 0,
  },
}));
