import { client } from '#/shared/openapi/requests/client.gen'
import { refreshAuthRefreshPost } from '#/shared/openapi/requests/sdk.gen'
import { LocalStorage } from '#/shared/lib/LocalStorage'
import { useProfileStore } from '#/shared/stores/profileStore'
import { toApiError } from '#/shared/lib/apiError'

client.setConfig({
  baseUrl: import.meta.env.VITE_BACKEND_API_URL ?? 'http://localhost:8000',
  // Без этого клиент возвращал `{ data, error }` и никогда не бросал: поэтому
  // во всей витрине работала схема `if (result.data) { … }` без ветки отказа, а
  // глобальный обработчик ошибок TanStack Query не срабатывал вообще — мутация
  // «успешно» завершалась с пустыми данными.
  throwOnError: true,
})

// Код ответа в выброшенное значение сам по себе не попадает — бросается только
// тело. Без кода нельзя ни выбрать текст сообщения, ни решить, повторять ли
// запрос, поэтому приводим ошибку к общему виду прямо здесь.
client.interceptors.error.use((error, response) => toApiError(error, response.status))

let refreshPromise: Promise<boolean> | null = null

async function refreshToken(): Promise<boolean> {
  const storedRefreshToken = LocalStorage.get('refresh_token')
  if (!storedRefreshToken) return false

  try {
    const result = await refreshAuthRefreshPost({
      body: { refresh_token: storedRefreshToken },
    })
    if (result.data) {
      useProfileStore.getState().setTokens(result.data.access_token, result.data.refresh_token)
      return true
    }
    return false
  } catch {
    return false
  }
}

client.interceptors.request.use((request) => {
  const token = useProfileStore.getState().token
  if (token && !request.headers.has('Authorization')) {
    request.headers.set('Authorization', `Bearer ${token}`)
  }
  return request
})

/**
 * Методы, у которых 401 — это ответ по существу, а не просроченный токен.
 *
 * Все они что-то проверяют: пароль, код из SMS. «Неверный код» и «истёк токен»
 * приходят одним и тем же кодом ответа, различить их можно только по адресу.
 * Без этого списка неверный код запускал обновление токена и повтор запроса, и
 * дальше ломались две вещи сразу: пользователь видел «Нет связи с сервером»
 * вместо «неверный код» (после повтора ответ терял свой код), а сервер считал
 * две попытки вместо одной — из пяти разрешённых оставалось две.
 */
const CREDENTIAL_PATHS = [
  '/auth/login',
  '/auth/refresh',
  '/auth/otp/verify',
  '/auth/phone/change/verify',
]

/**
 * Запросы, которые уже повторяли после обновления токена.
 *
 * Повтор идёт через тот же перехватчик, поэтому второй 401 запускал обновление
 * снова — и так по кругу. Один повтор — это всё, что имеет смысл: если и с
 * новым токеном отказ, дело не в токене.
 */
const retried = new WeakSet<Request>()

client.interceptors.response.use(async (response, request, opts) => {
  if (response.status !== 401) return response
  if (CREDENTIAL_PATHS.some((path) => request.url.includes(path))) return response
  if (retried.has(request)) return response

  if (!refreshPromise) {
    refreshPromise = refreshToken().finally(() => {
      refreshPromise = null
    })
  }

  const success = await refreshPromise
  if (!success) {
    useProfileStore.getState().clearAuth()
    return response
  }

  const token = useProfileStore.getState().token
  request.headers.set('Authorization', `Bearer ${token}`)
  retried.add(request)
  const _fetch = opts.fetch ?? globalThis.fetch
  return _fetch(request)
})
