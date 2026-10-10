/**
 * Единая точка форматирования денег в приложении.
 *
 * Зачем: суммы приходят с бэкенда строками ("1790.127"), складываются в
 * double и выводились «как есть» — на экране корзины это давало
 * «4303.900000000001 TMT» и «−198.90300000000025 TMT», а одна и та же цена
 * показывалась то с двумя знаками, то с тремя. Плюс суффикс валюты был
 * захардкожен примерно в 19 местах.
 *
 * Правила: ровно два знака после запятой, разделитель разрядов —
 * неразрывный пробел, код валюты берётся из данных товара
 * (`Product.Item["currency"]` -> `Currency.Short`), TMT — запасной вариант.
 */

/** Код валюты, если сервер его не прислал. */
export const DEFAULT_CURRENCY_CODE = 'TMT'

/** Знаков после запятой во всех денежных суммах. */
export const MONEY_FRACTION_DIGITS = 2

/** Разделитель разрядов — неразрывный пробел, чтобы сумма не рвалась переносом. */
export const MONEY_GROUP_SEPARATOR = '\u00A0'

/** Десятичный разделитель (ru/tk/tr — запятая). */
export const MONEY_DECIMAL_SEPARATOR = ','

/** Типографский минус (U+2212), а не дефис. */
export const MONEY_MINUS_SIGN = '−'

/** Сумма может прийти числом, строкой из API или отсутствовать. */
export type MoneyValue = number | string | null | undefined

/** Валюту можно передать кодом или объектом `Currency.Short` из товара. */
export type CurrencySource = string | { code?: string | null } | null | undefined

/** Безопасное приведение к числу: мусор и NaN дают 0. */
export const toMoneyNumber = (value: MoneyValue): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value !== 'string') return 0

  // Пробелы (в т.ч. неразрывные) — разделители разрядов, их убираем.
  // Запятая считается десятичной точкой только если точки в строке нет,
  // иначе "1,234.56" превратилось бы в NaN.
  const cleaned = value.replace(/[\s\u00A0\u202F]/g, '').trim()
  const parsed = Number(cleaned.includes('.') ? cleaned : cleaned.replace(',', '.'))

  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * Копейки целым числом. Знак выносится до округления, иначе Math.round
 * округляет −12.345 в −12.34 (в сторону нуля), а не в −12.35.
 */
const toCents = (num: number): number => {
  const factor = 10 ** MONEY_FRACTION_DIGITS
  const sign = num < 0 ? -1 : 1

  return sign * Math.round((Math.abs(num) + Number.EPSILON) * factor)
}

/**
 * Округление до копеек без «хвостов» double.
 * roundMoney(198.90300000000025) === 198.9
 */
export const roundMoney = (value: MoneyValue): number =>
  toCents(toMoneyNumber(value)) / 10 ** MONEY_FRACTION_DIGITS

/**
 * Сложение сумм в копейках — не накапливает погрешность double.
 * Использовать везде, где считается итог корзины/заказа.
 */
export const sumMoney = (values: MoneyValue[]): number => {
  const cents = values.reduce<number>((acc, value) => acc + toCents(toMoneyNumber(value)), 0)

  return cents / 10 ** MONEY_FRACTION_DIGITS
}

/** Код валюты из товара (`currency`), из строки или запасной TMT. */
export const getCurrencyCode = (currency?: CurrencySource): string => {
  const code = typeof currency === 'string' ? currency : currency?.code

  return code?.trim() ? code.trim().toUpperCase() : DEFAULT_CURRENCY_CODE
}

/** Число без валюты: 4303.900000000001 -> "4 303,90". */
export const formatAmount = (
  value: MoneyValue,
  fractionDigits: number = MONEY_FRACTION_DIGITS,
): string => {
  const rounded = roundMoney(value)
  const isNegative = rounded < 0
  const [intPart, fractionPart = ''] = Math.abs(rounded).toFixed(fractionDigits).split('.')

  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, MONEY_GROUP_SEPARATOR)
  const body = fractionPart ? `${grouped}${MONEY_DECIMAL_SEPARATOR}${fractionPart}` : grouped

  return isNegative ? `${MONEY_MINUS_SIGN}${body}` : body
}

/**
 * Основной форматтер: сумма + код валюты одной строкой.
 * formatMoney(4303.900000000001) -> "4 303,90 TMT"
 * formatMoney(product.price, product.currency) -> "1 790,13 TMT"
 */
export const formatMoney = (value: MoneyValue, currency?: CurrencySource): string =>
  `${formatAmount(value)}\u00A0${getCurrencyCode(currency)}`

/**
 * Для скидок и списаний: всегда со знаком минус, независимо от знака входа.
 * formatMoneyDiscount(198.90300000000025) -> "−198,90 TMT"
 */
export const formatMoneyDiscount = (value: MoneyValue, currency?: CurrencySource): string => {
  const amount = Math.abs(roundMoney(value))

  return amount === 0
    ? formatMoney(0, currency)
    : `${MONEY_MINUS_SIGN}${formatMoney(amount, currency)}`
}

export default formatMoney
