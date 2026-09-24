import { create } from 'zustand'
import { LocalStorage } from '#/shared/lib/LocalStorage'

const loadCityId = (): number | null => {
  const raw = LocalStorage.get('city_id')
  return raw ? Number(raw) : null
}

interface CityState {
  cityId: number | null
  setCityId: (cityId: number) => void
}

export const useCityStore = create<CityState>((set) => ({
  cityId: loadCityId(),
  setCityId: (cityId) => {
    LocalStorage.set('city_id', String(cityId))
    set({ cityId })
  },
}))
