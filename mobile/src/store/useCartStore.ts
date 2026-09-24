import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import storage from "./storage";

export interface CartItem {
  productId: number;
  quantity: number;
}

interface CartStoreState {
  items: CartItem[];
  addItem: (productId: number) => void;
  updateItem: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId) => {
        const { items } = get();
        const existingItem = items.find((item) => item.productId === productId);

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.productId === productId
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            ),
          });
        } else {
          set({
            items: [...items, { productId, quantity: 1 }],
          });
        }
      },

      updateItem: (productId, quantity) => {
        const { items } = get();

        if (quantity <= 0) {
          set({
            items: items.filter((item) => item.productId !== productId),
          });
          return;
        }

        set({
          items: items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item,
          ),
        });
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => storage.zustandStorage),
    },
  ),
);