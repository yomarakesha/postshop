type Key = 'locale' | 'lang' | 'access_token' | 'refresh_token' | 'cart' | 'city_id'

const isClient = typeof window !== 'undefined'

export const LocalStorage = {
  set: (key: Key, value: string) => {
    if (isClient) localStorage.setItem(key, value)
  },
  get: (key: Key) => {
    if (isClient) return localStorage.getItem(key)
    return null
  },
  delete: (key: Key) => {
    if (isClient) localStorage.removeItem(key)
  },
}
