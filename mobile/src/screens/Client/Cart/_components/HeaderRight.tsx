import React from "react";
import { Pressable } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import TrashIcon from "@assets/icons/trash.svg";

type Props = {
  onDelete: () => void;
  isEmpty: boolean;
};

const HeaderRight = ({ onDelete, isEmpty }: Props) => {
  if (isEmpty) {
    return null;
  }
  return (
    <Pressable onPress={onDelete} hitSlop={12}>
      <TrashIcon height={20} width={20} style={styles.passive2} />
    </Pressable>
  );
};

export default HeaderRight;

const styles = StyleSheet.create((theme) => ({
  passive2: {
    color: theme.colors.passive2,
  },
}));
