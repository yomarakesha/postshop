import storage from "@/store/storage";
import appStore from "@/store/useAppStore";
import { Appearance } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { darkThemeColors } from "./dark";
import { lightThemeColors } from "./light";

/**
 * Скругления. На витрине это одна переменная --radius-base: 12px, и приложение
 * использует ровно её же значение — но записанное как spacing(3), то есть «три
 * отступа». По коду невозможно было понять, что это радиус, а не расстояние,
 * и подобрать согласованное значение для нового элемента.
 */
const RADIUS = {
  /** Карточки, поля, кнопки — базовое скругление витрины. */
  base: 12,
  /** Мелкие элементы: бейджи, чипы. */
  small: 8,
  /** Круглые кнопки и аватары. */
  full: 999,
} as const;

const shadows = {
  soft: {
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
  },
  hard: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
  },
};

const lightTheme = {
  colors: lightThemeColors,
  shadows: {
    soft: {
      ...shadows.soft,
      shadowColor: lightThemeColors.text,
    },
    hard: {
      ...shadows.hard,
      shadowColor: lightThemeColors.text,
    },
  },
  spacing: (v: number) => v * 4,
  radius: RADIUS,
};

const darkTheme = {
  colors: darkThemeColors,
  shadows: {
    soft: {
      ...shadows.soft,
      shadowColor: darkThemeColors.text,
    },
    hard: {
      ...shadows.hard,
      // Была опечатка: тёмная тема брала цвет тени из светлой палитры.
      shadowColor: darkThemeColors.text,
    },
  },
  spacing: (v: number) => v * 4,
  radius: RADIUS,
};

const appThemes = {
  light: lightTheme,
  dark: darkTheme,
};

const breakpoints = {
  xs: 0,
};

type AppBreakpoints = typeof breakpoints;
type AppThemes = typeof appThemes;

declare module "react-native-unistyles" {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
  settings: {
    initialTheme: () => {
      const store = storage.mmkv.getString("app-store");
      const theme: AppTheme | null = store
        ? JSON.parse(store).state.theme
        : null;
      const colorScheme = Appearance.getColorScheme() || "light";

      if (theme === "system") {
        if (colorScheme === "unspecified") {
          appStore.setState({ theme: "light" });
          return "light";
        }
        appStore.setState({ theme: colorScheme as AppTheme });
        return colorScheme;
      }

      if (!theme) {
        appStore.setState({ theme: "light" });
        return "light";
      }

      return theme;
    },
  },
  breakpoints,
  themes: appThemes,
});
