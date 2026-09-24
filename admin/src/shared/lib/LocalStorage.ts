type Key = 'locale' | 'lang' | 'access_token' | 'refresh_token'

export const LocalStorage = {
  set: (key: Key, value: string) => {
    localStorage.setItem(key, value)
  },
  get: (key: Key) => {
    return localStorage.getItem(key)
  },
  delete: (key: Key) => {
    localStorage.removeItem(key)
  },
}
