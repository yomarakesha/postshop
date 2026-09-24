import React from "react";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import SearchIcon from "@assets/icons/search.svg";
import TextInput from "../TextInput";
import { Platform, Pressable, TextInputProps, View , StyleProp, TextStyle, ViewStyle } from "react-native";
import CloseIcon from "@assets/icons/close.svg";

type Props = TextInputProps & {
  onClose?: () => void;
  flex?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

const SearchInput = ({ onClose, flex, containerStyle, ...rest }: Props) => {
  return (
    <View style={[styles.container, flex && styles.flex1, containerStyle]}>
      <SearchIcon style={styles.searchIcon} />
      <TextInput
        placeholderTextColor={styles.input.placeholderTextColor}
        placeholder="Gözle"
        style={styles.input}
        returnKeyType="search"
        {...rest}
      />
      {onClose && (
        <Pressable onPress={onClose}>
          <CloseIcon style={styles.closeIcon} />
        </Pressable>
      )}
    </View>
  );
};

export default SearchInput;

const styles = StyleSheet.create((theme) => ({
  flex1: {
    flex: 1,
  },
  container: {
    paddingHorizontal: theme.spacing(3.5),
    paddingVertical: Platform.select({
      ios: theme.spacing(2.5),
      default: 0,
    }),
    borderRadius: theme.spacing(3),
    backgroundColor: theme.colors.gray2,
    gap: theme.spacing(2.5),
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontFamily: "GoogleSans-Regular",
    fontSize: 16,
    placeholderTextColor: theme.colors.passive2,
  },
  searchIcon: {
    color: theme.colors.passive2,
  },
  closeIcon: {
    color: theme.colors.passive2,
  },
}));
