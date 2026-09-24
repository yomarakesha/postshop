import { type RefObject } from "react";
import { TextInput as RNTextInput, TextInputProps } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import TextInput from "../TextInput";

interface OTPInputProps extends TextInputProps {
  innerRef: RefObject<RNTextInput | null>;
  isError?: boolean;
}
const OTPInput = ({ innerRef, isError, ...rest }: OTPInputProps) => {
  return (
    <TextInput
      ref={innerRef}
      autoComplete="one-time-code"
      enterKeyHint="next"
      style={[styles.input, isError && styles.negativeInput]}
      inputMode="numeric"
      placeholder="*"
      {...rest}
    />
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  // Скругление было задано, а рамки и подложки — нет: на экране висели голые
  // звёздочки без единой ячейки вокруг них, и куда вводить код, понять было
  // нельзя. Размер тоже не задавался — ячейка сжималась по содержимому и
  // прыгала по ширине, когда цифра сменяла «*».
  input: {
    width: 48,
    height: 56,
    fontSize: 30,
    fontFamily: "GoogleSans-Bold",
    borderRadius: theme.spacing(3),
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    backgroundColor: theme.colors.white,
    textAlign: "center",
    color: theme.colors.text,
  },
  negativeInput: {
    color: theme.colors.failure,
    borderColor: theme.colors.failure,
  },
}));

export default OTPInput;
