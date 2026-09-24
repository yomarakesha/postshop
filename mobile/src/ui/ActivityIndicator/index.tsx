import { memo } from "react";
import {
  StyleSheet,
  UnistylesVariants,
  withUnistyles,
} from "react-native-unistyles";
import {
  ActivityIndicator as RNActivityIndicator,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";

const UniActivityIndicator = withUnistyles(RNActivityIndicator, (theme) => ({
  color: theme.colors.blueMain,
}));

interface Props extends UnistylesVariants<typeof styles> {
  style?: StyleProp<ViewStyle>;
  /**
   * Явный цвет спиннера. Нужен на цветных подложках: пять экранов уже
   * передавали `color={theme.colors.white}` внутрь кнопки, но проп нигде
   * не принимался — на синей кнопке крутился синий индикатор, то есть
   * состояние загрузки было не видно.
   */
  color?: string;
}

const ActivityIndicator = ({ style, color, ...rest }: Props) => {
  styles.useVariants(rest);

  return (
    // Порядок важен: стиль от вызывающего кода должен перекрывать базовый,
    // а не наоборот (раньше вариант isFullScreen затирал переданный style).
    <View style={[styles.themedWrapper, style]}>
      {color ? (
        <RNActivityIndicator color={color} />
      ) : (
        <UniActivityIndicator />
      )}
    </View>
  );
};

const styles = StyleSheet.create(() => ({
  themedWrapper: {
    variants: {
      isFullScreen: {
        true: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        },
      },
    },
  },
}));

export default memo(ActivityIndicator);
