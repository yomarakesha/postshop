import i18n from '#/app/localization'

/**
 * Ошибка запроса в виде, пригодном для показа человеку.
 *
 * Сгенерированный клиент по умолчанию не бросает исключений: он возвращает
 * `{ data, error }`. Из-за этого во всей витрине работала схема
 * `if (result.data) { … }` без ветки отказа, а глобальный обработчик ошибок
 * TanStack Query не срабатывал никогда — мутация «успешно» завершалась с
 * пустыми данными. Для пользователя это выглядело так: нажал — ничего не
 * произошло, и непонятно, сохранилось или нет.
 *
 * Теперь клиент настроен бросать (см. app/setupApiClient.ts), а перехватчик
 * приводит выброшенное к этому виду: код ответа сам по себе в исключение не
 * попадает, а без него нельзя ни выбрать текст, ни решить, повторять ли запрос.
 */
export interface ApiError {
  status: number
  /** Текст от сервера, если он есть и пригоден для показа. */
  detail?: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

/**
 * Достаёт текст ошибки из тела ответа FastAPI.
 *
 * Обычная ошибка — `{ detail: "текст" }`. Ошибка проверки данных (422) —
 * `{ detail: [{ loc, msg }, …] }`, там собираем сообщения через точку с запятой.
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

/**
 * Текст для показа: сначала объяснение по коду ответа, затем — сообщение
 * сервера, если оно есть. Технические тексты вроде «Not Found» показывать
 * бессмысленно, поэтому они остаются в консоли, а человек видит перевод.
 */
export const getErrorMessage = (error: unknown): string => {
  const t = i18n.t.bind(i18n)

  if (!isApiError(error)) {
    // Сеть недоступна или запрос не дошёл — тела ответа нет вообще.
    return t('errors.network')
  }

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

  if (error.status >= 500) return t('errors.server')

  // Сообщения сервера на английском, поэтому свой текст показываем первым, а
  // серверный добавляем как уточнение — оно часто называет конкретную причину.
  const known: string | undefined = byStatus[error.status]
  if (known) return error.detail ? `${known}: ${error.detail}` : known
  return error.detail ?? t('errors.unknown')
}

/**
 * Текст ошибки для записи, которая отправляла файлы (фото, логотип).
 *
 * Без ответа сервера getErrorMessage говорит «Нет связи с сервером», и на
 * слабой мобильной связи это сбивало с толку: связь-то есть, страница
 * открыта, просто тяжёлая загрузка оборвалась посреди. Человеку нужно знать,
 * что именно не дошло и что делать, — поэтому отдельный текст.
 */
export const getUploadErrorMessage = (error: unknown): string =>
  isApiError(error) ? getErrorMessage(error) : i18n.t('errors.uploadInterrupted')

/**
 * Ошибка сохранения товара: штрихкод объясняем по-человечески.
 *
 * Сервер отвечает 422 «vendor_barcode: …» на неверный формат и 409, если такой
 * заводской штрихкод уже есть у другого товара этого магазина. Показывать эти
 * английские тексты продавцу бессмысленно.
 */
export const getProductSaveErrorMessage = (error: unknown, withUpload: boolean): string => {
  if (isApiError(error)) {
    if (error.status === 422 && error.detail?.startsWith('vendor_barcode')) {
      return i18n.t('productBarcode.invalid')
    }
    if (error.status === 409 && error.detail?.includes('barcode')) {
      return i18n.t('productBarcode.duplicate')
    }
    return getErrorMessage(error)
  }
  return withUpload ? getUploadErrorMessage(error) : getErrorMessage(error)
}
