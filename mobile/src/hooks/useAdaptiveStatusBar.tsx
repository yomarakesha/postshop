import { useCallback } from "react";
import { setStatusBarStyle } from "expo-status-bar";
import { useFocusEffect } from "expo-router";
import { isColorDark } from "@/utils/processColor";

export function useAdaptiveStatusBar(backgroundColor?: string) {
  useFocusEffect(
    useCallback(() => {
      const style = backgroundColor
        ? isColorDark(backgroundColor)
          ? "light"
          : "dark"
        : "light";
      setStatusBarStyle(style, true);
    }, [backgroundColor]),
  );
}