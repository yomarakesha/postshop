type Key = 'locale' | 'lang' | 'access_token' | 'refresh_token'

/**
 * Префикс ключей админки.
 *
 * Админка открывается на одном домене с витриной (shop.post.tm/admin), а
 * localStorage у них общий: под одним ключом access_token вход в админку
 * делал сотрудника вошедшим и на витрине, а вход на витрине выкидывал его из
 * админки. Свой префикс разводит их хранилища.
 */
const PREFIX = 'postshop_admin:'

export const LocalStorage = {
  set: (key: Key, value: string) => {
    localStorage.setItem(PREFIX + key, value)
  },
  get: (key: Key) => {
    return localStorage.getItem(PREFIX + key)
  },
  delete: (key: Key) => {
    localStorage.removeItem(PREFIX + key)
  },
}
