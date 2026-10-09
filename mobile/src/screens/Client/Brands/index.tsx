import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet } from "react-native-unistyles";
import Header from "@/components/Header";
import SearchInput from "@/ui/SearchInput";
import { FlatList, ListRenderItem, View } from "react-native";

import { brandApi } from "@/api/brandApi";
import { getImageUrl } from "@/utils/getImageUrl";
import { useRouter } from "expo-router";
import ActivityIndicator from "@/ui/ActivityIndicator";
import { useTranslation } from "react-i18next";
import useDebounceSearch from "@/hooks/useDebounceSearch";
import Typography from "@/ui/Typography";
import { Image } from "expo-image";
import emptySearchImage from "@assets/images/empty-search.png";
import LogoTile from "@/ui/LogoTile";

const BrandsScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounceSearch(search);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    brandApi.useGetInfiniteList({
      skip: 0,
      limit: 10,
      name: debouncedSearch || undefined,
      // Как на витрине: без заблокированных и без брендов, у которых нет
      // товаров, — иначе список вёл на пустые страницы.
      is_active: true,
      has_products: true,
    });

  const onPressBrand = (id: number) => {
    router.push({
      pathname: "/brands/[id]",
      params: { id },
    });
  };

  const renderItem: ListRenderItem<Brand.Item> = useCallback(
    ({ item }) => {
      return (
        <LogoTile
          onPress={() => onPressBrand(item.id)}
          image={getImageUrl(item.image_path)}
        />
      );
    },
    [data],
  );

  const keyExtractor = useCallback((item: Brand.Item) => {
    return String(item.id);
  }, []);

  const brands = useMemo(() => {
    return data?.pages.flat() || [];
  }, [data]);

  const handleEndReached = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };
  return (
    <>
      <Header
        title={t("client.brands.headerTitle")}
        backgroundColor="white"
        withGoBack
        headerBottom={
          <SearchInput
            placeholder={t("common.search")}
            containerStyle={styles.search}
            onChangeText={(text) => setSearch(text)}
            value={search}
          />
        }
      />
      {isLoading ? (
        <ActivityIndicator isFullScreen />
      ) : (
        <FlatList
          data={brands}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={3}
          columnWrapperStyle={{ gap: 8 }}
          contentContainerStyle={styles.list}
          onEndReached={handleEndReached}
          ListFooterComponent={() =>
            isFetchingNextPage && <ActivityIndicator />
          }
          ListEmptyComponent={() => (
            <>
              {isLoading ? (
                <ActivityIndicator isFullScreen />
              ) : (
                brands.length === 0 && (
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
                )
              )}
            </>
          )}
        />
      )}
    </>
  );
};

export default BrandsScreen;

const styles = StyleSheet.create((theme, unistyles) => ({
  list: {
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(4),
    gap: 8,
    flexGrow: 1,
  },
  search: {
    marginHorizontal: theme.spacing(4),
  },
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
