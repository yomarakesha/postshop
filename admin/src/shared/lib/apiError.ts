import i18n from '@/app/localization'

/**
 * Ошибка запроса в виде, пригодном для показа человеку.
 *
 * Все 50 хуков мутаций в админке объявляли только onSuccess: onError не было
 * ни у одного, и на уровне QueryClient тоже. Создание валюты с занятым кодом
 * отвечало 400, а на экране не менялось ничего — ни тоста, ни текста, кнопка
 * выглядела так же. То же касалось одобрения и отклонения заявок магазинов,
 * модерации товаров, блокировки магазина и приёмки товара.
 *
 * Код ответа в выброшенное значение сам по себе не попадает — бросается только
 * тело, — поэтому перехватчик приводит ошибку к этому виду.
 */
export interface ApiError {
  status: number
  detail?: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

/**
 * Достаёт текст ошибки из тела ответа FastAPI: `{ detail: "текст" }` либо
 * `{ detail: [{ loc, msg }, …] }` для ошибок проверки данных.
 */
const extractDetail = (body: unknown): string | undefined => {
  if (typeof body === 'string') return body.trim() || undefined
  if (!isRecord(body)) return undefined

  const detail = body.detail
  if (typeof detail === 'string') return detail.trim() || undefined

  if (Array.isArray(detail)) {
    const messages = detail
      .map((entry) => (isRecord(entry) && typeof entry.msg === 'string' ? entry.msg : null))
      .filter((msg): msg is string => Boolean(msg))
    if (messages.length > 0) return messages.join('; ')
  }

  return undefined
}

export const toApiError = (body: unknown, status: number): ApiError => ({
  status,
  detail: extractDetail(body),
})

const isApiError = (error: unknown): error is ApiError =>
  isRecord(error) && typeof error.status === 'number'

/** Текст для показа: объяснение по коду ответа плюс сообщение сервера. */
export const getErrorMessage = (error: unknown): string => {
  const t = i18n.t.bind(i18n)

  if (!isApiError(error)) return t('errors.network')
  if (error.status >= 500) return t('errors.server')

  const byStatus: Record<number, string> = {
    400: t('errors.badRequest'),
    401: t('errors.unauthorized'),
    403: t('errors.forbidden'),
    404: t('errors.notFound'),
    409: t('errors.conflict'),
    413: t('errors.tooLarge'),
    422: t('errors.validation'),
    429: t('errors.tooManyRequests'),
  }

  const known: string | undefined = byStatus[error.status]
  if (known) return error.detail ? `${known}: ${error.detail}` : known
  return error.detail ?? t('errors.unknown')
}
