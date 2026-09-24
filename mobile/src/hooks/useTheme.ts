import appStore from "@/store/useAppStore";
import { useEffect, useMemo } from "react";
import { useColorScheme } from "react-native";
import { UnistylesRuntime } from "react-native-unistyles";
import { useShallow } from "zustand/shallow";

const useTheme = () => {
  const theme = appStore(useShallow((state) => state.theme));
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (theme === "system") {
      UnistylesRuntime.setAdaptiveThemes(true);
    } else {
      UnistylesRuntime.setAdaptiveThemes(false);
      UnistylesRuntime.setTheme(theme);
    }
  }, [theme]);

  return useMemo<Omit<AppTheme, "system">>(() => {
    if (theme === "system") {
      return colorScheme === "dark" ? "dark" : "light";
    }

    return theme;
  }, [colorScheme, theme]);
};

export default useTheme;
