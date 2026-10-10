import { createMMKV, MMKV } from 'react-native-mmkv'
import { StateStorage } from 'zustand/middleware'

const mmkv = createMMKV()

const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    mmkv.set(name, value)
  },
  getItem: (name) => {
    const value = mmkv.getString(name)
    return value ?? null
  },
  removeItem: (name) => {
    mmkv.remove(name)
  },
}

export default {
  mmkv,
  zustandStorage,
}
