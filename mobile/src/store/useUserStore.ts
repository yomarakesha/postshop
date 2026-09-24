import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import storage from "./storage";

type JWT = {
  accessToken: string;
  refreshToken: string;
};

interface UserStoreState {
  isGuest: boolean;
  user: User.Item | null;
  cityId: number | null;
  jwt: JWT | null;
}

export const useUserStore = create<UserStoreState>()(
  persist(
    (_set) => ({
      user: null,
      isGuest: true,
      cityId: null,
      jwt: null,
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => storage.zustandStorage),
    },
  ),
);
