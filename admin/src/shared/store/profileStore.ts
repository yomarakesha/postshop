import { create } from 'zustand'

import type { UserDetailResponse } from '../openapi/requests'

interface ProfileState {
  profile: UserDetailResponse | null
  setProfile: (profile: UserDetailResponse) => void
  permissions: string[]
  clearProfile: () => void
}

export const useProfileStore = create<ProfileState>()((set) => ({
  profile: null,
  permissions: [],
  setProfile: (profile) => {
    set({
      profile,
      permissions: profile.permissions?.map((i) => i.code),
    })
  },
  clearProfile: () => set({ profile: null }),
}))
