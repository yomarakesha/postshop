import React from "react";
import { Pressable } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import SearchIcon from "@assets/icons/search.svg";

type Props = {
  onSearch: () => void;
};

const HeaderRight = ({ onSearch }: Props) => {
  return (
    <Pressable onPress={onSearch}>
      <SearchIcon style={styles.icon} />
    </Pressable>
  );
};

export default HeaderRight;

const styles = StyleSheet.create((theme) => ({
  icon: {
    color: theme.colors.passive2,
  },
}));
