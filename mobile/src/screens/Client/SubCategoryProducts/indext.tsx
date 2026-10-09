import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TrueSheet } from "@lodev09/react-native-true-sheet";

import Header from "@/components/Header";
import SearchInput from "@/ui/SearchInput";
import ActivityIndicator from "@/ui/ActivityIndicator";
import ProductsVerticalList from "@/components/ProductsVerticalList";
import FilterSheet from "@/components/BottomSheet/FilterSheet";
import SortSheet from "@/components/BottomSheet/SortSheet";
import { productsApi } from "@/api/products";
import { useProductListStore } from "@/store/useProductListStore";

import HeaderBottom from "./_components/HeaderBottom";
import HeaderRight from "./_components/HeaderRight";
import useDebounceSearch from "@/hooks/useDebounceSearch";
import emptySearchImage from "@assets/images/empty-search.png";
import { useTranslation } from "react-i18next";
import { categoryApi } from "@/api/categoryApi";
import useAppStore from "@/store/useAppStore";
import EmptyState from "@/ui/EmptyState";
import Button from "@/ui/Button";
import RefreshControl from "@/ui/RefreshControl";
import { pickTranslatedName } from "@/utils/pickTranslation";

const SubCategoriesProductScreen = () => {
  const { categoryId, subCategoryId } = useLocalSearchParams();
  const router = useRouter();
  const filter = useProductListStore((s) => s.filter);
  const sort = useProductListStore((s) => s.sort);
  const { t } = useTranslation();
  const currentLanguage = useAppStore((s) => s.lang);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounceSearch(search);
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);

  const filterSheetRef = useRef<TrueSheet | null>(null);
  const sortSheetRef = useRef<TrueSheet | null>(null);

  const {
    data,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    refetch,
  } = productsApi.useGetInfiniteList({
    skip: 0,
    limit: 15,
    category_ids: [Number(subCategoryId)],
    name: debouncedSearch || undefined,
    price_from: filter.priceFrom || undefined,
    price_to: filter.priceTo || undefined,
    brand_ids: filter.brands?.map((b) => b.id) || undefined,
    shop_base_ids: filter.shops?.map((s) => s.id) || undefined,
    sort: sort || undefined,
  });
  const subCategoryQuery = categoryApi.useGet(Number(subCategoryId));

  const handleFilter = () => {
    filterSheetRef.current?.present();
    setFilterSheetOpen(true);
  };

  const handleSort = () => {
    sortSheetRef.current?.present();
    setSortSheetOpen(true);
  };

  const handleSearch = () => setOpenSearch(true);

  const handleCloseSearch = () => {
    setOpenSearch(false);
    setSearch("");
  };

  const handleOnChangeSearch = (text: string) => {
    setSearch(text);
  };

  const handlePressProduct = useCallback(
    (id: number) => {
      router.push({ pathname: "/products/[id]", params: { id: String(id) } });
    },
    [router],
  );

  // Если у категории нет перевода на текущий язык, заголовок экрана
  // оставался пустым — теперь подставляется запасной перевод.
  const getTranslationName = useCallback(
    (translations?: Category.Translation[]) =>
      pickTranslatedName(translations, currentLanguage),
    [currentLanguage],
  );

  const handleEndReached = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  const products = useMemo(() => data?.pages.flat() || [], [data]);

  useEffect(() => {
    return () => {
      useProductListStore.getState().reset();
    };
  }, []);

  const hasFilterApplied = useMemo(
    () =>
      Boolean(
        filter.shops?.length ||
        filter.brands?.length ||
        filter.priceFrom !== null ||
        filter.priceTo !== null,
      ),
    [filter],
  );

  useEffect(() => {
    if (!categoryId || !subCategoryId) {
      router.back();
    }
  }, [categoryId, subCategoryId, router]);

  // Сбрасываем только фильтр: выбранная сортировка ничего не скрывает.
  const handleResetFilter = () => {
    useProductListStore.setState({
      filter: { shops: null, brands: null, priceFrom: null, priceTo: null },
    });
  };

  const hasSortApplied = useMemo(() => sort !== null, [sort]);

  const openFilter = filterSheetOpen || hasFilterApplied;
  const openSort = sortSheetOpen || hasSortApplied;

  if (!categoryId || !subCategoryId) {
    return null;
  }

  return (
    <>
      <Header
        title={
          !openSearch && !subCategoryQuery.isLoading
            ? getTranslationName(subCategoryQuery.data?.translations)
            : undefined
        }
        withGoBack
        backgroundColor="white"
        headerBottom={
          openSearch ? undefined : (
            <HeaderBottom
              onFilter={handleFilter}
              onSort={handleSort}
              openFilter={openFilter}
              openSort={openSort}
              t={t}
            />
          )
        }
        headerRight={
          openSearch ? undefined : <HeaderRight onSearch={handleSearch} />
        }
        headerCenter={
          openSearch ? (
            <SearchInput
              onClose={handleCloseSearch}
              autoFocus
              onChangeText={handleOnChangeSearch}
              value={search}
            />
          ) : subCategoryQuery.isLoading ? (
            <ActivityIndicator />
          ) : undefined
        }
      />

      <ProductsVerticalList
        onPress={handlePressProduct}
        data={products}
        onEndReached={handleEndReached}
        isFetchingNextPage={isFetchingNextPage}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />
        }
        t={t}
        ListEmptyComponent={() => {
          if (isLoading) return <ActivityIndicator isFullScreen />;
          if (search) {
            return (
              <EmptyState
                image={emptySearchImage}
                title={t("emptyState.search.title")}
                description={t("emptyState.search.description")}
              />
            );
          }
          // С фильтром пустой список не значит пустой раздел: раньше здесь
          // писалось «в этом разделе ничего не опубликовано», хотя товары
          // были — их скрыл выбранный бренд или цена.
          if (hasFilterApplied) {
            return (
              <EmptyState
                image={emptySearchImage}
                title={t("emptyState.filtered.title")}
                description={t("emptyState.filtered.description")}
              >
                <Button
                  variant="secondary"
                  title={t("emptyState.filtered.reset")}
                  onPress={handleResetFilter}
                />
              </EmptyState>
            );
          }
          // Без поиска экран пустой категории оставался белым листом.
          return (
            <EmptyState
              image={emptySearchImage}
              title={t("emptyState.products.title")}
              description={t("emptyState.products.description")}
            />
          );
        }}
      />

      <FilterSheet
        ref={filterSheetRef}
        onDidDismiss={() => setFilterSheetOpen(false)}
        t={t}
      />
      <SortSheet
        ref={sortSheetRef}
        onDidDismiss={() => setSortSheetOpen(false)}
        t={t}
      />
    </>
  );
};

export default SubCategoriesProductScreen;
