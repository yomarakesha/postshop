import React from "react";
import Typography from "@/ui/Typography";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import ArrowLeft from "@assets/icons/arrow-left.svg";
import SearchInput from "@/ui/SearchInput";
import { TFunction } from "i18next";

type Props = {
  onGoBack?: () => void;
  onChangeSearch: (text: string) => void;
  searchValue: string;
  t: TFunction;
};

const HeaderBottom = ({ onGoBack, onChangeSearch, searchValue, t }: Props) => {
  return (
    <View style={styles.container}>
      <Pressable style={styles.goBackButton} onPress={onGoBack}>
        <ArrowLeft style={styles.arrowLeft} />
      </Pressable>
      <SearchInput
        flex
        placeholder={t("client.shop.searchPlaceholder")}
        value={searchValue}
        onChangeText={onChangeSearch}
      />
    </View>
  );
};

export default HeaderBottom;

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing(3),
    gap: theme.spacing(2),
  },
  arrowLeft: {
    color: theme.colors.blueMain,
  },
  goBackButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: theme.spacing(3),
    backgroundColor: theme.colors.white,
  },
}));
