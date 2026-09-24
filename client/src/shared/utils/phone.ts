/**
 * Приведение телефона к единому виду для показа и для ссылки `tel:`.
 *
 * В базе номера лежат по-разному: продавцы вводят их и с кодом страны
 * («+99361011111»), и без него («61011111»). Интерфейс приписывал «+993»
 * безусловно, из-за чего в карточке магазина выводилось «+993 +99361011111».
 */

const COUNTRY_CODE = '+993'

/** Номер как его показывать: код страны ровно один раз. */
export const formatPhone = (phone: string) => {
  const trimmed = phone.trim()
  if (trimmed.startsWith('+')) return trimmed
  if (trimmed.startsWith('993')) return `${COUNTRY_CODE} ${trimmed.slice(3)}`
  return `${COUNTRY_CODE} ${trimmed}`
}

/** Значение для href="tel:" — без пробелов. */
export const phoneHref = (phone: string) => `tel:${formatPhone(phone).replace(/\s+/g, '')}`
