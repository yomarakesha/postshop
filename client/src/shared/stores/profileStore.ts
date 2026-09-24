import { create } from 'zustand'
import type { UserResponse } from '#/shared/openapi/requests'
import { LocalStorage } from '#/shared/lib/LocalStorage'

interface ProfileState {
  profile: UserResponse | null
  token: string | null
  isProfileLoading: boolean
  loginModalOpen: boolean
  setProfile: (profile: UserResponse | null) => void
  setProfileLoading: (loading: boolean) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  clearAuth: () => void
  openLoginModal: () => void
  closeLoginModal: () => void
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  token: LocalStorage.get('access_token'),
  isProfileLoading: true,
  loginModalOpen: false,
  setProfile: (profile) => set({ profile }),
  setProfileLoading: (isProfileLoading) => set({ isProfileLoading }),
  setTokens: (accessToken, refreshToken) => {
    LocalStorage.set('access_token', accessToken)
    LocalStorage.set('refresh_token', refreshToken)
    set({ token: accessToken })
  },
  clearAuth: () => {
    LocalStorage.delete('access_token')
    LocalStorage.delete('refresh_token')
    set({ token: null, profile: null })
  },
  openLoginModal: () => set({ loginModalOpen: true }),
  closeLoginModal: () => set({ loginModalOpen: false }),
}))
