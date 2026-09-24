import { View } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import RawCheckIcon from "@assets/icons/check.svg";

// Цвет галочки был захардкожен строкой "white" мимо темы.
const CheckIcon = withUnistyles(RawCheckIcon, (theme) => ({
  color: theme.colors.white,
}));

type Props = {
  isActive: boolean;
};

const CheckMark = ({ isActive }: Props) => {
  return (
    <View style={[styles.container, isActive && styles.active]}>
      {isActive && <CheckIcon width={16} height={16} />}
    </View>
  );
};

export default CheckMark;

const styles = StyleSheet.create((theme) => ({
  container: {
    width: 24,
    height: 24,
    borderRadius: 24,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    justifyContent: "center",
    alignItems: "center",
  },
  active: {
    backgroundColor: theme.colors.blueMain,
    // Без этого вокруг синей галочки оставалось светлое кольцо старой рамки.
    borderColor: theme.colors.blueMain,
  },
}));
