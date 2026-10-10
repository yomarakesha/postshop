import { create } from 'zustand'

interface PickupPointStoreState {
  selectedPickupPoint: PickupPoint.Item | null
  selectPickupPoint: (pickupPoint: PickupPoint.Item | null) => void
}

export const usePickupPointStore = create<PickupPointStoreState>()((set) => ({
  selectedPickupPoint: null,
  selectPickupPoint: (pickupPoint) => set({ selectedPickupPoint: pickupPoint }),
}))
