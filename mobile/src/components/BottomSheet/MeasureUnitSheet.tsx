import { MAX_PAGE_SIZE } from "@/constants/pagination";
import React, { RefObject, useCallback, useMemo } from "react";
import Typography from "@/ui/Typography";
import { ListRenderItem, Pressable } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { UniTrueSheet } from "@/ui/BottomSheet";
import HeaderSheet from "./HeaderSheet";
import { FlatList } from "react-native-gesture-handler";
import { measureUnitApi } from "@/api/measureUnit";
import ActivityIndicator from "@/ui/ActivityIndicator";
import { TFunction } from "i18next";

type Props = {
  ref: RefObject<TrueSheet | null>;
  onSelect: (measureUnitId: number, name: string) => void;
  currentLanguage: AppLang | null;
  t: TFunction;
};

const MeasureUnitSheet = ({ ref, onSelect, currentLanguage, t }: Props) => {
  const measurUnitsQuery = measureUnitApi.useGetAll({
    skip: 0,
    limit: MAX_PAGE_SIZE,
  });
  const onClose = () => {
    ref.current?.dismiss();
  };

  const data = useMemo(() => {
    return measurUnitsQuery.data || [];
  }, [measurUnitsQuery.data]);

  const getTranslation = useCallback(
    (translations: MeasureUnit.Translation[]) => {
      const name = translations.find(
        (t) => t.language === currentLanguage,
      )?.name;

      return name ?? translations[0]?.name;
    },
    [currentLanguage],
  );

  const renderItem: ListRenderItem<MeasureUnit.Item> = useCallback(
    ({ item, index }) => {
      return (
        <Pressable
          style={styles.item(index === data.length - 1)}
          onPress={() => onSelect(item.id, getTranslation(item.translations))}
        >
          <Typography weight="medium">
            {getTranslation(item.translations)}
          </Typography>
        </Pressable>
      );
    },
    [data, getTranslation, onSelect],
  );

  const keyExtractor = useCallback(
    (item: MeasureUnit.Item) => item.id.toString(),
    [],
  );

  return (
    <UniTrueSheet
      ref={ref}
      scrollable
      detents={[0.5, 1]}
      style={styles.wrapper}
    >
      <HeaderSheet
        title={t("sheets.measurementUnit.title")}
        onClose={onClose}
      />
      {measurUnitsQuery.isPending ? (
        <ActivityIndicator style={styles.loader} />
      ) : null}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.contentContainer}
      />
    </UniTrueSheet>
  );
};

export default MeasureUnitSheet;

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
  item: (isLast: boolean) => ({
    paddingVertical: theme.spacing(4),
    borderBottomWidth: isLast ? 0 : 1,
    borderBottomColor: theme.colors.stroke,
    gap: theme.spacing(2),
    flexDirection: "row",
    alignItems: "center",
  }),
  contentContainer: {
    paddingHorizontal: theme.spacing(4),
    borderRadius: theme.spacing(4),
    backgroundColor: theme.colors.gray2,
  },
}));
