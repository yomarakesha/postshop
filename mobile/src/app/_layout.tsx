import api, { getIsOnline, showNetworkToast } from "@/api";
import useTheme from "@/hooks/useTheme";
import useAppStore from "@/store/useAppStore";
import ConfirmationModal from "@/ui/ConfitmationModal";
import ErrorAlert from "@/utils/errorAlert";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import React, { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import NetInfo from "@react-native-community/netinfo";
import ComposeProviders, {
  ProviderConfig,
} from "../providers/ComposeProviders";

// Предотвращаем автоматическое скрытие системного сплэш-скрина
SplashScreen.preventAutoHideAsync().catch(() => {
  /* Игнорируем ошибки повторной инициализации */
});

const isNetworkFetchError = (e: unknown): boolean => {
  if (!(e instanceof TypeError)) return false;
  if (e.message === "Network request failed") return true;
  if (e.message === "Failed to fetch") return true;
  if (e.message === "Network Error") return true;

  return false;
};

const RootLayout = () => {
  const theme = useTheme();
  const mode = useAppStore((s) => s.mode);
  const refetch = useAppStore((s) => s.refetch);
  const isServerAvailable = useAppStore((s) => s.isServerAvailable);
  const { t } = useTranslation();
  const apiUrl = useAppStore((s) => s.apiUrl);

  const providers: ProviderConfig[] = [
    [QueryClientProvider, { client: api.client }],
    SafeAreaProvider,
    [GestureHandlerRootView, { style: { flex: 1 } }],
    KeyboardProvider,
  ];

  const [fontsLoaded] = useFonts({
    "GoogleSans-Regular": require("@assets/fonts/GoogleSans-Regular.ttf"),
    "GoogleSans-Medium": require("@assets/fonts/GoogleSans-Medium.ttf"),
    "GoogleSans-SemiBold": require("@assets/fonts/GoogleSans-SemiBold.ttf"),
    "GoogleSans-Bold": require("@assets/fonts/GoogleSans-Bold.ttf"),
  });

  // Логика проверки здоровья сервера с жестким тайм-аутом
  const checkHealth = useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      await fetch(`${apiUrl}/`, { signal: controller.signal });
      useAppStore.getState().setServerAvailable(true);
    } catch (e: any) {
      if (e.name === "AbortError" || isNetworkFetchError(e)) {
        useAppStore.getState().setServerAvailable(false);
        ErrorAlert(t, { message: "Network Error" } as any);
      } else {
        // Любая другая ошибка запроса тоже значит, что сервер недоступен —
        // иначе состояние "заморозится" на предыдущем значении навсегда.
        useAppStore.getState().setServerAvailable(false);
      }
    } finally {
      clearTimeout(timeoutId);
      useAppStore.getState().setRefetch(false);
    }
  }, [apiUrl, t]);

  useEffect(() => {
    if (refetch) {
      checkHealth();
    }
  }, [refetch, checkHealth]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = getIsOnline(state);
      const wasOnline = useAppStore.getState().hasInternetConnection;

      if (wasOnline !== online) {
        useAppStore.getState().setHasInternetConnection(online);
      }

      if (!online) {
        if (useAppStore.getState().mode === "client") {
          showNetworkToast();
        }
      } else if (!wasOnline) {
        // Связь восстановилась — перепроверяем доступность сервера,
        // не дожидаясь ручного действия пользователя.
        useAppStore.getState().setRefetch(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // Пока сервер недоступен, периодически перепроверяем сам, без участия
  // пользователя (кнопка "Повторить" на экранах дергает лишь свой запрос
  // данных и не знает о глобальном состоянии сервера, поэтому без этого
  // опроса пользователь оставался бы заперт на экране "Нет интернета" до
  // перезапуска приложения).
  useEffect(() => {
    if (isServerAvailable) return;

    const intervalId = setInterval(() => {
      if (!useAppStore.getState().refetch) {
        useAppStore.getState().setRefetch(true);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isServerAvailable]);

  // Скрываем нативный сплэш, как только шрифты готовы
  useEffect(() => {
    if (!fontsLoaded) return;
    SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ComposeProviders providers={providers}>
      <ConfirmationModal />
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(become-seller)" />

        <Stack.Protected guard={mode === "client"}>
          <Stack.Screen name="(client-tabs)" />
        </Stack.Protected>

        <Stack.Protected guard={mode === "shop"}>
          <Stack.Screen name="(shop-tabs)" />
        </Stack.Protected>
      </Stack>
      <Toast />
    </ComposeProviders>
  );
};

export default RootLayout;