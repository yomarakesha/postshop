import { MAX_PAGE_SIZE } from "@/constants/pagination";
import React, { useMemo } from "react";
import Typography from "@/ui/Typography";
import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import HeaderSheet from "./HeaderSheet";
import SearchInput from "@/ui/SearchInput";
import { brandApi } from "@/api/brandApi";
import { UniTrueSheet } from "@/ui/BottomSheet";
import ActivityIndicator from "@/ui/ActivityIndicator";
import EmptyState from "@/ui/EmptyState";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { Image } from "expo-image";
import { getImageUrl } from "@/utils/getImageUrl";
import useDebounceSearch from "@/hooks/useDebounceSearch";
import { TFunction } from "i18next";

type Props = {
  ref: React.RefObject<TrueSheet | null>;
  onSelect: (brandId: number, name: string) => void;
  t: TFunction;
};

const BrandSheet = ({ ref, onSelect, t }: Props) => {
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounceSearch(search);
  const brandsQuery = brandApi.useGetAll({
    skip: 0,
    limit: MAX_PAGE_SIZE,
    name: debouncedSearch,
  });

  const onClose = () => {
    ref.current?.dismiss();
  };

  const onChangeSearch = (text: string) => {
    setSearch(text);
  };

  const data = useMemo(() => {
    return brandsQuery.data || [];
  }, [brandsQuery.data]);

  return (
    <UniTrueSheet
      ref={ref}
      scrollable
      detents={[0.6, 1]}
      style={styles.wrapper}
    >
      <HeaderSheet title={t("brand")} onClose={onClose} />
      <SearchInput
        placeholder={t("common.search")}
        containerStyle={styles.search}
        value={search}
        onChangeText={onChangeSearch}
      />
      {/* Раньше во время загрузки и при пустом поиске оставался пустой
          серый прямоугольник без единого слова. */}
      {brandsQuery.isPending ? (
        <ActivityIndicator style={styles.loader} />
      ) : data.length === 0 ? (
        <EmptyState compact title={t("emptyState.search.title")} />
      ) : null}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {data.map((item, index) => (
          <Pressable
            style={styles.item(index === data.length - 1)}
            key={item.id}
            onPress={() => onSelect(item.id, item.name)}
          >
            <View style={styles.logoContainer}>
              <Image
                source={getImageUrl(item.image_path)}
                contentFit="contain"
                style={styles.logo}
              />
            </View>
            <Typography weight="medium">{item.name}</Typography>
          </Pressable>
        ))}
      </ScrollView>
    </UniTrueSheet>
  );
};

export default BrandSheet;

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    paddingHorizontal: theme.spacing(4),
    paddingTop: 0,
    // Без нижнего отступа последняя строка списка упиралась в край шторки.
    paddingBottom: theme.spacing(4),
  },
  search: {
    marginBottom: theme.spacing(2),
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
