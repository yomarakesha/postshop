import React from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type Props = {
  isActive: boolean;
  backgroundColor?: string;
};

const Radio = ({ isActive, backgroundColor }: Props) => {
  return (
    <View
      style={[
        styles.radio,
        backgroundColor ? { backgroundColor } : undefined,
        isActive && styles.selectedRadio,
      ]}
    />
  );
};

export default Radio;

const styles = StyleSheet.create((theme) => ({
  radio: {
    width: 20,
    height: 20,
    borderRadius: "100%",
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },
  selectedRadio: {
    borderWidth: 5,
    borderColor: theme.colors.blueMain,
  },
}));
