import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import storage from './storage'

interface ShopStoreState {
  activeShopBaseId: number | null
  shop: ShopAdditional.Item | null
}

const useShopStore = create<ShopStoreState>()(
  persist(
    (_set) => ({
      activeShopBaseId: null,
      shop: null,
    }),
    {
      name: 'shop-storage',
      storage: createJSONStorage(() => storage.zustandStorage),
    },
  ),
)

export default useShopStore
