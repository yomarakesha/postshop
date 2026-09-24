import { MAX_PAGE_SIZE } from "@/constants/pagination";
import React, { useMemo } from "react";
import Typography from "@/ui/Typography";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { searchApi } from "@/api/searchApi";
import { useUserStore } from "@/store/useUserStore";
import ProductsVerticalList from "@/components/ProductsVerticalList";
import { Router, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import ActivityIndicator from "@/ui/ActivityIndicator";

type Props = {
  search: string;
  t: TFunction;
  focus: boolean;
  router: Router;
};

const Products = ({ search, t, focus , router }: Props) => {
  const cityId = useUserStore((s) => s.cityId);

  // Было `/products/?name=` — совпадение по подстроке целиком. Запрос из двух
  // слов оно не переживало: «nusay ноутбук» не находило ничего.
  const searchQuery = searchApi.useSearch(
    {
      q: search,
      city_id: cityId,
      limit: MAX_PAGE_SIZE,
      skip: 0,
    },
    { enabled: focus && search.length >= 1 },
  );

  const products = useMemo(() => {
    if (search.length === 0) return [];
    return searchQuery.data?.products || [];
  }, [searchQuery.data, search]);

  const onPressProduct = (productId: number) => {
    router.push({
      pathname: "/products/[id]",
      params: {
        id: String(productId),
      },
    });
  };

  return (
    <ProductsVerticalList
      data={products}
      onPress={onPressProduct}
      t={t}
      ListEmptyComponent={
        searchQuery.isLoading ? <ActivityIndicator isFullScreen /> : null
      }
    />
  );
};

export default Products;

const styles = StyleSheet.create((theme) => ({
  container: {},
}));
