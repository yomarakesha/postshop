import { toApiError } from '@/shared/lib/apiError'
import { LocalStorage } from '@/shared/lib/LocalStorage'
import { client } from '@/shared/openapi/requests/client.gen'
import { refreshAuthRefreshPost } from '@/shared/openapi/requests/sdk.gen'

let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

async function doRefresh(): Promise<boolean> {
  const refreshToken = LocalStorage.get('refresh_token')
  if (!refreshToken) return false

  try {
    const res = await refreshAuthRefreshPost({
      body: { refresh_token: refreshToken },
      throwOnError: true,
    })
    LocalStorage.set('access_token', res.data.access_token)
    LocalStorage.set('refresh_token', res.data.refresh_token)
    return true
  } catch {
    return false
  }
}

function refreshTokens(): Promise<boolean> {
  if (!isRefreshing) {
    isRefreshing = true
    refreshPromise = doRefresh().finally(() => {
      isRefreshing = false
      refreshPromise = null
    })
  }
  return refreshPromise!
}

export function setupApiClient() {
  client.setConfig({
    baseUrl: import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000',
    // Часть вызовов передавала throwOnError вручную, остальные — нет, и для них
    // ошибочный ответ приходил как `{ data: undefined, error }`: мутация
    // завершалась «успешно», onError не срабатывал, на экране не менялось
    // ничего. Теперь бросают все.
    throwOnError: true,
  })

  client.interceptors.request.use((request) => {
    const token = LocalStorage.get('access_token')
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`)
    }
    return request
  })

  client.interceptors.error.use(async (error, response, request) => {
    if (response?.status !== 401 || request.url.includes('/auth/')) {
      // Код ответа в выброшенное значение не попадает, а без него нельзя ни
      // выбрать текст сообщения, ни отличить 403 от 500.
      return toApiError(error, response?.status ?? 0)
    }

    const refreshed = await refreshTokens()
    if (!refreshed) {
      LocalStorage.delete('access_token')
      LocalStorage.delete('refresh_token')
      window.location.href = `${import.meta.env.BASE_URL}login`
      return toApiError(error, response.status)
    }

    // Retry the original request with the new token
    const token = LocalStorage.get('access_token')!
    const retryRequest = new Request(request, {
      headers: new Headers(request.headers),
    })
    retryRequest.headers.set('Authorization', `Bearer ${token}`)

    const retryResponse = await fetch(retryRequest)
    if (retryResponse.ok) {
      // Return the successful data — throwing here would be caught as error,
      // so we need to return it in a way the client understands.
      // The client will re-throw since throwOnError is set, so we parse and return.
      return retryResponse
    }

    // Refresh succeeded but request still failed — give up
    LocalStorage.delete('access_token')
    LocalStorage.delete('refresh_token')
    window.location.href = `${import.meta.env.BASE_URL}login`
    return toApiError(error, retryResponse.status)
  })
}
