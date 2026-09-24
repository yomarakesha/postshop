import { PropsWithChildren } from "react";
import { StyleProp, Text, TextStyle, GestureResponderEvent } from "react-native";
import {
  StyleSheet,
  UnistylesVariants,
  withUnistyles,
} from "react-native-unistyles";

const UniText = withUnistyles(Text, (theme) => ({
  selectionColor: theme.colors.blueMain,
}));

export interface TypographyProps extends UnistylesVariants<typeof styles> {
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  selectable?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
}
const Typography = ({
  children,
  style,
  numberOfLines,
  onPress,
  ...rest
}: PropsWithChildren<TypographyProps>) => {
  styles.useVariants(rest);

  return (
    <UniText
      style={[styles.baseText, styles.themedText, style]}
      numberOfLines={numberOfLines}
      selectable={rest.selectable}
      onPress={onPress}
    >
      {children}
    </UniText>
  );
};

/**
 * Размеры взяты у витрины — но те, которые она показывает НА ТЕЛЕФОНЕ.
 *
 * На сайте размеры резиновые, через clamp(min, vw, max). Приложение забрало из
 * них максимум, то есть десктопный: заголовок h1 был 38px против 24px, которые
 * сайт рисует на узком экране, h2 — 30 против ~20. Заголовки получались в
 * полтора раза крупнее, съедали ширину, ломали выравнивание и читались как
 * «лишние отступы» — на это и жаловались.
 *
 * Межстрочные (140/150/130%) и мелкие размеры (p3/t1/t2) у сайта и приложения
 * совпадали изначально, их не трогаем.
 */
const TYPOGRAPHY_SCALE = {
  h1: { fontSize: 24, lineHeight: 24 * 1.4 }, // сайт: clamp(24px, 4vw, 36px)
  h2: { fontSize: 20, lineHeight: 20 * 1.4 }, // сайт: clamp(18px, 5vw, 30px)
  h3: { fontSize: 18, lineHeight: 18 * 1.4 }, // сайт: clamp(18px, 2.5vw, 24px)
  p1: { fontSize: 17, lineHeight: 17 * 1.5 }, // сайт: clamp(17px, 2vw, 20px)
  p2: { fontSize: 16, lineHeight: 16 * 1.5 }, // сайт: clamp(16px, 1.8vw, 18px)
  p3: { fontSize: 16, lineHeight: 16 * 1.5 }, // сайт: 16px
  t1: { fontSize: 14, lineHeight: 14 * 1.3 }, // сайт: 14px
  t2: { fontSize: 12, lineHeight: 12 * 1.3 }, // сайт: 12px
} as const;

const styles = StyleSheet.create((theme) => ({
  baseText: {
    fontFamily: "GoogleSans-Regular",
  },
  themedText: {
    variants: {
      variant: {
        h1: TYPOGRAPHY_SCALE.h1,
        h2: TYPOGRAPHY_SCALE.h2,
        h3: TYPOGRAPHY_SCALE.h3,
        p1: TYPOGRAPHY_SCALE.p1,
        p2: TYPOGRAPHY_SCALE.p2,
        p3: TYPOGRAPHY_SCALE.p3,
        t1: TYPOGRAPHY_SCALE.t1,
        t2: TYPOGRAPHY_SCALE.t2,
        default: TYPOGRAPHY_SCALE.p3,
      },
      weight: {
        regular: { fontFamily: "GoogleSans-Regular" },
        medium: { fontFamily: "GoogleSans-Medium" },
        bold: { fontFamily: "GoogleSans-Bold" },
        semiBold: { fontFamily: "GoogleSans-SemiBold" },
        default: { fontFamily: "GoogleSans-Regular" },
      },
      isLineThrough: {
        true: {
          textDecorationLine: "line-through",
        },
      },
      isUnderlined: {
        true: {
          textDecorationLine: "underline",
        },
      },
      isCentered: {
        true: {
          textAlign: "center",
        },
      },
      color: {
        default: {
          color: theme.colors.text,
        },
        secondary: {
          color: theme.colors.passive2,
        },
        tertiary: {
          color: theme.colors.passive1,
        },
        error: {
          color: theme.colors.failure,
        },
        warning: {
          color: theme.colors.warning,
        },
        main: {
          color: theme.colors.blueMain,
        },
        white: {
          color: theme.colors.white,
        },
        success: {
          color: theme.colors.success,
        },
        // Раньше здесь стоял theme.colors.text — то же значение, что и у
        // варианта default: «выключенный» текст выглядел полностью активным.
        disabled: {
          color: theme.colors.passive1,
        },
      },
    },
  },
}));

export default Typography;
