import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TrueSheet } from "@lodev09/react-native-true-sheet";

import Typography from "@/ui/Typography";
import SearchInput from "@/ui/SearchInput";
import Header from "@/components/Header";
import ProductsVerticalList from "@/components/ProductsVerticalList";
import FilterSheet from "@/components/BottomSheet/FilterSheet";
import SortSheet from "@/components/BottomSheet/SortSheet";
import { brandApi } from "@/api/brandApi";
import { productsApi } from "@/api/products";
import { useProductListStore } from "@/store/useProductListStore";
import { getImageUrl } from "@/utils/getImageUrl";

import HeaderCenter from "./_components/HeaderCenter";
import HeaderRight from "./_components/HederRight";
import HeaderBottom from "./_components/HeaderBottom";
import useDebounceSearch from "@/hooks/useDebounceSearch";
import ActivityIndicator from "@/ui/ActivityIndicator";
import { Image } from "expo-image";
import emptySearchImage from "@assets/images/empty-search.png";
import { useTranslation } from "react-i18next";

const BrandScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const filter = useProductListStore((s) => s.filter);
  const sort = useProductListStore((s) => s.sort);
  const { t } = useTranslation();

  const [isSearch, setIsSearch] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounceSearch(search);
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const filterSheetRef = useRef<TrueSheet | null>(null);
  const sortSheetRef = useRef<TrueSheet | null>(null);

  // 2. API
  const brandQuery = brandApi.useGet(Number(id), {
    enabled: !!id,
  });
  const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } =
    productsApi.useGetInfiniteList(
      {
        skip: 0,
        limit: 15,
        name: debouncedSearch || undefined,
        price_from: filter.priceFrom || undefined,
        price_to: filter.priceTo || undefined,
        brand_ids: [Number(id)],
        shop_base_ids: filter.shops?.map((s) => s.id) || undefined,
        sort: sort || undefined,
      },
      {
        enabled: !!id,
      },
    );

  const handleFilter = () => {
    filterSheetRef.current?.present();
    setFilterSheetOpen(true);
  };

  const handleSort = () => {
    sortSheetRef.current?.present();
    setSortSheetOpen(true);
  };

  const handleOnChangeSearch = (text: string) => {
    setSearch(text);
  };

  const handleCloseSearch = () => {
    setIsSearch(false);
    setSearch("");
  };

  const handlePressProduct = useCallback(
    (id: number) => {
      router.push({ pathname: "/products/[id]", params: { id: String(id) } });
    },
    [router],
  );

  const handleEndReached = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  const products = useMemo(() => data?.pages.flat() || [], [data]);

  useEffect(() => {
    if (!id || brandQuery.isError) {
      router.back();
    }
  }, [id, brandQuery.isError]);

  useEffect(() => {
    return () => {
      useProductListStore.getState().reset();
    };
  }, []);

  const hasFilterApplied = useMemo(
    () =>
      Boolean(
        filter.shops?.length ||
        filter.priceFrom !== null ||
        filter.priceTo !== null,
      ),
    [filter],
  );

  const hasSortApplied = useMemo(() => sort !== null, [sort]);

  const openFilter = filterSheetOpen || hasFilterApplied;
  const openSort = sortSheetOpen || hasSortApplied;

  if (!id || brandQuery.isError || brandQuery.isLoading) {
    return null;
  }

  return (
    <>
      <Header
        headerRight={
          isSearch ? undefined : (
            <HeaderRight onSearch={() => setIsSearch(true)} />
          )
        }
        backgroundColor="white"
        headerCenter={
          isSearch ? (
            <SearchInput
              onClose={handleCloseSearch}
              autoFocus
              onChangeText={handleOnChangeSearch}
              value={search}
              placeholder={t("common.search")}
              style={{ flexGrow: 1 }}
            />
          ) : (
            <HeaderCenter image={getImageUrl(brandQuery.data?.image_path)} />
          )
        }
        headerBottom={
          <HeaderBottom
            onFilter={handleFilter}
            onSort={handleSort}
            openFilter={openFilter}
            openSort={openSort}
            t={t}
          />
        }
        withGoBack
      />

      <ProductsVerticalList
        onPress={handlePressProduct}
        t={t}
        data={products}
        onEndReached={handleEndReached}
        withoutBrand
        isFetchingNextPage={isFetchingNextPage}
        ListEmptyComponent={() => (
          <>
            {isLoading ? (
              <ActivityIndicator isFullScreen />
            ) : (
              <View style={styles.imageWrapper}>
                <Image
                  source={emptySearchImage}
                  style={styles.image}
                  contentFit="contain"
                />
                <View>
                  <Typography variant="p1" weight="semiBold" isCentered>
                    {t("emptyState.search.title")}
                  </Typography>
                  <Typography
                    variant="t1"
                    weight="medium"
                    color="secondary"
                    isCentered
                    style={{ marginTop: 8 }}
                  >
                    {t("emptyState.search.description")}
                  </Typography>
                </View>
              </View>
            )}
          </>
        )}
      />

      <FilterSheet
        ref={filterSheetRef}
        onDidDismiss={() => setFilterSheetOpen(false)}
        withoutBrands
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

export default BrandScreen;

const styles = StyleSheet.create((theme) => ({
  container: {},
  imageWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 40,
  },
  image: {
    width: 120,
    height: 80,
  },
}));
