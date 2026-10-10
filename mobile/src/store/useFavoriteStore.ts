import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import storage from './storage'

type FavoriteState = {
  favorites: number[]
  toggleFavorite: (productId: number) => void
  clearFavorites: () => void
}

const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favorites: [],

      toggleFavorite: (productId) =>
        set((state) => ({
          favorites: state.favorites.includes(productId)
            ? state.favorites.filter((id) => id !== productId)
            : [...state.favorites, productId],
        })),

      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => storage.zustandStorage),
    },
  ),
)

export default useFavoriteStore
