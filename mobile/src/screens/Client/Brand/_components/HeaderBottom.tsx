import React, { useCallback } from "react";
import Typography from "@/ui/Typography";
import { FlatList, ListRenderItem, Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import FilterIcon from "@assets/icons/filter.svg";
import SortIcon from "@assets/icons/sort.svg";
import RecommendationsHorizontalList from "@/components/RecommendationsHorizontalList";
import { TFunction } from "i18next";

type Props = {
  onFilter: () => void;
  onSort: () => void;
  openSort: boolean;
  openFilter: boolean;
  t: TFunction;
};

const HeaderBottom = ({ onFilter, onSort, openSort, openFilter, t }: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.actionsButtons}>
        <Pressable
          onPress={onSort}
          style={[styles.button, openSort && styles.buttonActive]}
        >
          <SortIcon style={styles.icon(openSort)} />
          <Typography
            weight="medium"
            variant="p3"
            color={openSort ? "main" : undefined}
          >
            {t("sheets.sort.title")}
          </Typography>
        </Pressable>
        <Pressable
          onPress={onFilter}
          style={[styles.button, openFilter && styles.buttonActive]}
        >
          <FilterIcon style={styles.icon(openFilter)} />
          <Typography
            weight="medium"
            variant="p3"
            color={openFilter ? "main" : undefined}
          >
            {t("sheets.filter.title")}
          </Typography>
        </Pressable>
      </View>
      {/* <RecommendationsHorizontalList data={recommendations} /> */}
    </View>
  );
};

export default HeaderBottom;

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing(4),
  },
  flex1: {
    flex: 1,
  },
  actionsButtons: {
    flexDirection: "row",
    gap: theme.spacing(2),
    paddingHorizontal: theme.spacing(3),
  },
  buttonActive: {
    backgroundColor: theme.colors.blue2,
  },
  icon: (isActive: boolean) => ({
    color: isActive ? theme.colors.blueMain : theme.colors.text,
  }),
  button: {
    paddingVertical: theme.spacing(2),
    paddingHorizontal: theme.spacing(4),
    borderRadius: theme.spacing(3),
    backgroundColor: theme.colors.gray2,
    flexDirection: "row",
    gap: theme.spacing(2),
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
}));
