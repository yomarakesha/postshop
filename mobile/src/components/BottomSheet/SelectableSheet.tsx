import { Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import React, { RefObject } from "react";
import Typography from "@/ui/Typography";
import HeaderSheet from "./HeaderSheet";
import Radio from "@/ui/Radio";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { UniTrueSheet } from "@/ui/BottomSheet";

export type SelectableItem<T> = {
  key: T;
  value: string;
};

type Props<T> = {
  ref: RefObject<TrueSheet | null>;
  title: string;
  data: SelectableItem<T>[];
  selectedKey: T | null;
  onSelect: (key: T) => void;
};
const SelectableSheet = <T extends string | number>({
  ref,
  title,
  data,
  selectedKey,
  onSelect,
}: Props<T>) => {
  const { height } = useWindowDimensions();
  const handleClose = () => {
    ref.current?.dismiss();
  };

  return (
    // Высота окна — по содержимому, а список ограничен тремя четвертями
    // экрана и прокручивается. Без предела окно «по содержимому» растягивалось
    // на весь список, нижние пункты уходили за край экрана, а прокручивать
    // было нечего: в выборе региона из 13 городов последний, Aşgabat, выбрать
    // было нельзя. Короткие списки (язык, сортировка) выглядят как раньше.
    <UniTrueSheet ref={ref} detents={["auto"]} style={styles.wrapper}>
      <HeaderSheet title={title} onClose={handleClose} />
      <ScrollView
        style={{ maxHeight: height * 0.75 }}
        contentContainerStyle={styles.container}
        nestedScrollEnabled
      >
        <View style={styles.content}>
          {data.map((item, index) => (
            <Pressable
              onPress={() => {
                onSelect(item.key);
                handleClose();
              }}
              key={String(item.key)}
              style={styles.item(index === data.length - 1)}
            >
              <Typography variant="p2" weight="medium">
                {item.value}
              </Typography>
              <Radio isActive={item.key === selectedKey} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </UniTrueSheet>
  );
};

export default SelectableSheet;

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    paddingHorizontal: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    paddingTop: 0,
  },
  container: {
    gap: theme.spacing(10),
  },
  content: {
    backgroundColor: theme.colors.gray2,
    borderRadius: theme.spacing(3),
    paddingHorizontal: theme.spacing(4),
  },
  item: (isLast: boolean) => ({
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing(4),
    borderBottomWidth: isLast ? 0 : 1,
    borderBottomColor: theme.colors.stroke,
  }),
}));
