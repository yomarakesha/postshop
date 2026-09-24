import React, { useCallback } from "react";
import Typography from "@/ui/Typography";
import { FlatList, ListRenderItem, Pressable } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type Props = {
  data: string[];
};

const RecommendationsHorizontalList = ({ data }: Props) => {
  const renderItem: ListRenderItem<string> = ({ item }) => {
    return (
      <Pressable style={styles.button}>
        <Typography variant="p3" weight="medium">
          {item}
        </Typography>
      </Pressable>
    );
  };

  const keyExtractor = useCallback((item: string) => {
    return item;
  }, []);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      horizontal
      scrollEnabled={data.length > 1}
      showsHorizontalScrollIndicator={false}
      nestedScrollEnabled
      contentContainerStyle={styles.list}
    />
  );
};

export default RecommendationsHorizontalList;

const styles = StyleSheet.create((theme) => ({
  button: {
    paddingVertical: theme.spacing(2),
    paddingHorizontal: theme.spacing(4),
    borderRadius: theme.spacing(3),
    backgroundColor: theme.colors.gray2,
    flexDirection: "row",
    gap: theme.spacing(2),
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    gap: theme.spacing(2),
    paddingHorizontal: theme.spacing(3),
  },
}));
