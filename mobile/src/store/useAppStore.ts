import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import storage from "./storage";

type Mode = "client" | "shop";

interface AppStoreState {
  theme: AppTheme | null;
  lang: AppLang | null;
  mode: Mode;
  hasInternetConnection: boolean;
  setHasInternetConnection: (value: boolean) => void;
  isServerAvailable: boolean;
  setServerAvailable: (value: boolean) => void;
  refetch: boolean;
  setRefetch: (value: boolean) => void;
  apiUrl: string;
  setApiUrl: (url: string) => void;
}

const useAppStore = create<AppStoreState>()(
  persist(
    (set) => ({
      theme: "light",
      mode: "client",
      lang: null,
      hasInternetConnection: true,
      refetch: true,
      // Пусто по умолчанию: адрес сервера вводится на первом экране.
      // EXPO_PUBLIC_API_URL остаётся как запасной вариант для разработки.
      apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "",
      setHasInternetConnection: (value) =>
        set({ hasInternetConnection: value }),
      setRefetch: (value) => set({ refetch: value }),
      setApiUrl: (url) => set({ apiUrl: url }),
      setServerAvailable: (value) => set({ isServerAvailable: value }),
      isServerAvailable: false
    }),
    {
      name: "app-store",
      storage: createJSONStorage(() => storage.zustandStorage),
      partialize: (state) => ({
        theme: state.theme,
        mode: state.mode,
        lang: state.lang,
        // Адрес сервера не сохранялся, поэтому введённый вручную сбрасывался
        // при каждом перезапуске приложения.
        apiUrl: state.apiUrl,
      }),
    },
  ),
);

export default useAppStore;
