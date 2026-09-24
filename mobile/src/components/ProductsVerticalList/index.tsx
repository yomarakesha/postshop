import useFavorite from "@/hooks/useFavorite";
import useAppStore from "@/store/useAppStore";
import ActivityIndicator from "@/ui/ActivityIndicator";
import EmptyState from "@/ui/EmptyState";
import React, { useCallback } from "react";
import { FlatList, FlatListProps, ListRenderItem } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import ProductCard from "../../ui/ProductCard";
import emptySearchImage from "@assets/images/empty-search.png";
import { TFunction } from "i18next";

type Props = Omit<FlatListProps<Product.Item>, "renderItem"> & {
  withoutBrand?: boolean;
  /**
   * Данные ещё грузятся.
   *
   * Пустой список и список, который не успел прийти, — разные вещи, а
   * выглядели одинаково: пока шёл запрос, на экране успевало мигнуть
   * «Товаров пока нет» с картинкой, и только потом появлялись товары.
   * Особенно заметно при переходе «Смотреть все» с главной.
   */
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  onPress: (id: number) => void;
  withoutFavorite?: boolean;
  t: TFunction;
};

const ProductsVerticalList = ({
  data,
  withoutBrand,
  isLoading,
  isFetchingNextPage,
  onPress,
  onEndReached,
  withoutFavorite = false,
  t,
  ...props
}: Props) => {
  const currentLanguage = useAppStore((s) => s.lang);
  const { data: favoritesData, toggleFavorite } = useFavorite({
    enabled: !withoutFavorite,
    t,
  });

  const renderItem: ListRenderItem<Product.Item> = useCallback(
    ({ item }) => {
      return (
        <ProductCard
          data={item}
          isFavorite={favoritesData.some((i) => i.id === item.id)}
          withoutBrand={withoutBrand}
          currentLanguage={currentLanguage}
          onPress={() => onPress(item.id)}
          onToggleFavorite={() => toggleFavorite(item)}
          withoutFavorite={withoutFavorite}
          t={t}
        />
      );
    },
    [
      withoutBrand,
      onPress,
      favoritesData,
      toggleFavorite,
      currentLanguage,
      withoutFavorite,
      t,
    ],
  );

  const keyExtractor = useCallback((item: Product.Item) => String(item.id), []);

  // Раньше при пустом списке экран оставался просто белым: пустое состояние
  // было только у поиска. Свой ListEmptyComponent у экрана перекрывает этот
  // (props расширяются ниже).
  const renderEmpty = useCallback(
    () =>
      isLoading ? (
        <ActivityIndicator isFullScreen />
      ) : (
        <EmptyState
          image={emptySearchImage}
          title={t("emptyState.products.title")}
          description={t("emptyState.products.description")}
        />
      ),
    [isLoading, t],
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={2}
      columnWrapperStyle={styles.column}
      style={styles.container}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.8}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator style={styles.footerLoader} />
        ) : null
      }
      {...props}
    />
  );
};

export default ProductsVerticalList;

const styles = StyleSheet.create((theme) => ({
  // Был magic-отступ marginTop: -9, из-за которого верх сетки заезжал
  // под скруглённый низ шапки.
  container: { flex: 1 },
  // Разметка сетки: поля по краям, зазор между рядами и зазор между колонками
  // — все три равны theme.spacing(2). Из этих же трёх отступов ProductCard
  // считает свою ширину ((ширина экрана - spacing(2) * 3) / 2), поэтому менять
  // их можно только вместе, иначе колонки перестанут попадать в поля.
  list: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(5),
    paddingHorizontal: theme.spacing(2),
    gap: theme.spacing(2),
    flexGrow: 1,
  },
  column: {
    gap: theme.spacing(2),
    // Карточки ряда тянутся до высоты самой высокой: у одной есть строка
    // бренда, у другой нет — нижние края переставали совпадать.
    alignItems: "stretch",
  },
  footerLoader: {
    paddingVertical: theme.spacing(4),
  },
}));
